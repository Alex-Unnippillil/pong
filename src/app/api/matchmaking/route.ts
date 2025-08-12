import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking_queue'

export async function POST() {
  const session = await getServerAuthSession()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const opponentId = await redis.lpop<string>(QUEUE_KEY)

    if (opponentId && opponentId !== userId) {
      const match = {
        id: crypto.randomUUID(),
        players: [opponentId, userId],
      }
      return NextResponse.json(match)
    }

    await redis.rpush(QUEUE_KEY, userId)
    return NextResponse.json({ queued: true }, { status: 202 })
  } catch (err) {
    return NextResponse.json({ error: 'queue_failed' }, { status: 500 })
  }
}
