import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking:queue'

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const userId = session.user.id
  try {
    const opponent = await redis.lpop(QUEUE_KEY)
    if (!opponent) {
      await redis.rpush(QUEUE_KEY, userId)
      return NextResponse.json({ queued: true })
    }

    const matchId = randomUUID()
    await redis.set(
      `match:${matchId}`,
      JSON.stringify({ p1: opponent, p2: userId }),
    )
    return NextResponse.json({ p1: opponent, p2: userId, matchId })
  } catch (err) {
    return NextResponse.json({ error: 'queue error' }, { status: 500 })
  }
}
