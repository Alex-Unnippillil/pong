import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  mode: z.enum(['classic']).default('classic'),
})

export const runtime = 'nodejs'

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
    const opponent = await redis.lpop<string>('matchmaking:queue')
    if (!opponent) {
      await redis.rpush('matchmaking:queue', userId)
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
  } catch (err) {
    return NextResponse.json({ error: 'queue error' }, { status: 500 })
  }
}
