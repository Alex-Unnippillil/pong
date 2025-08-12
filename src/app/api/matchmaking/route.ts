import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'
export async function POST() {
  const session = await getServerAuthSession()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const opponentId = await redis.lpop<string>('matchmaking:queue')

    if (!opponentId) {
      await redis.rpush('matchmaking:queue', userId)
      return NextResponse.json({ queued: true })
    }

    const matchId = randomUUID()
    await redis.set(
      `matchmaking:match:${matchId}`,
      JSON.stringify({ p1: opponentId, p2: userId }),
    )

    return NextResponse.json({ p1: opponentId, p2: userId, matchId })
  } catch {
    return NextResponse.json({ error: 'queue error' }, { status: 500 })
  }
}
