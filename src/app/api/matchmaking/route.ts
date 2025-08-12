import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking:queue'

// A simple matchmaking endpoint. When a user posts to this endpoint we try to
// pull another waiting user from a Redis queue. If an opponent is found a match
// is created and returned to the caller. Otherwise the user is enqueued and the
// caller is informed that they're waiting for an opponent.
export async function POST(_req: Request) {
  const session = await getServerAuthSession()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const opponentId = await redis.lpop<string>(QUEUE_KEY)
    if (opponentId && opponentId !== userId) {
      const matchId = randomUUID()
      await redis.set(
        `match:${matchId}`,
        JSON.stringify({ p1: opponentId, p2: userId }),
      )
      return NextResponse.json({ matchId, p1: opponentId, p2: userId })
    }

    await redis.rpush(QUEUE_KEY, userId)
    return NextResponse.json({ queued: true })
  } catch {
    return NextResponse.json({ error: 'queue error' }, { status: 500 })
  }
}
