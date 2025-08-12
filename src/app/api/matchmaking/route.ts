import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  mode: z.enum(['classic']).default('classic'),
})

export const runtime = 'nodejs'

const QUEUE_KEY = 'matchmaking:queue'
const QUEUE_TTL_SECONDS = 60

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  const userId = session.user.id
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 })
    }
    const { mode } = parsed.data
    const opponent = await redis.lpop<string>(QUEUE_KEY)
    if (!opponent || opponent === userId) {
      const alreadyQueued = await redis.lpos<number>(QUEUE_KEY, userId)
      if (alreadyQueued === null) {
        await redis.rpush(QUEUE_KEY, userId)
      }
      await redis.expire(QUEUE_KEY, QUEUE_TTL_SECONDS)
      return NextResponse.json({ queued: true })
    }
    const match = await prisma.match.create({
      data: { p1Id: opponent, p2Id: userId, mode, p1Score: 0, p2Score: 0 },
    })
    await redis.set(
      `match:${match.id}`,
      JSON.stringify({ p1: opponent, p2: userId }),
    )
    return NextResponse.json({ p1: opponent, p2: userId, matchId: match.id })
  } catch {
    return NextResponse.json({ error: 'queue error' }, { status: 500 })
  }
}
