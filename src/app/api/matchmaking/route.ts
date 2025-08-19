import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env.server'
import { ok, error } from '@/lib/api-response'

const bodySchema = z.object({
  mode: z.enum(['classic', 'ranked']).default('classic'),
})

export const runtime = 'nodejs'

const QUEUE_KEY = 'matchmaking:queue'

export async function POST(req: Request) {
  if (!redis) {
    return error('service unavailable', 503)
  }

  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthenticated', 401)
  }
  const userId = session.user.id
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return error('invalid mode', 400)
    }
    const { mode } = parsed.data
    const opponent = await redis.lpop<string>(QUEUE_KEY)
    if (!opponent || opponent === userId) {
      const alreadyQueued = await redis.lpos<number>(QUEUE_KEY, userId)
      if (alreadyQueued === null) {
        await redis.rpush(QUEUE_KEY, userId)
      }
      await redis.expire(QUEUE_KEY, env.MATCHMAKING_QUEUE_TTL_SECONDS)
      return ok({ queued: true })
    }
    const match = await prisma.match.create({
      data: { p1Id: opponent, p2Id: userId, mode, p1Score: 0, p2Score: 0 },
    })
    await redis.set(
      `match:${match.id}`,
      JSON.stringify({ p1: opponent, p2: userId }),
      { ex: env.MATCH_TTL_SECONDS },
    )
    return ok({ p1: opponent, p2: userId, matchId: match.id })
  } catch {
    return error('queue error', 500)
  }
}
