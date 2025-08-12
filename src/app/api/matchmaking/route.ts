import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking_queue'

export async function POST() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const opponentId = await redis.lpop<string>(QUEUE_KEY)

    if (!opponentId || opponentId === userId) {
      await redis.rpush(QUEUE_KEY, userId)
      return NextResponse.json({ status: 'waiting' })
    }

    const matchId = crypto.randomUUID()
    await redis.hset(`match:${matchId}`, { p1Id: opponentId, p2Id: userId })

    return NextResponse.json({
      match: {
        id: matchId,
        p1Id: opponentId,
        p2Id: userId,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export const GET = POST
