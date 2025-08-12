import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking:queue'
const MATCH_KEY_PREFIX = 'matchmaking:match:'

export async function POST(_req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const playerId = session.user.id

  const existingMatch = await redis.get<string>(
    `${MATCH_KEY_PREFIX}${playerId}`,
  )
  if (existingMatch) {
    return NextResponse.json({ matchId: existingMatch })
  }

  const opponentId = await redis.lpop<string>(QUEUE_KEY)
  if (opponentId && opponentId !== playerId) {
    const matchId = crypto.randomUUID()
    await Promise.all([
      redis.set(`${MATCH_KEY_PREFIX}${playerId}`, matchId),
      redis.set(`${MATCH_KEY_PREFIX}${opponentId}`, matchId),
    ])
    return NextResponse.json({ matchId })
  }

  const queue = await redis.lrange<string>(QUEUE_KEY, 0, -1)
  if (!queue.includes(playerId)) {
    await redis.rpush(QUEUE_KEY, playerId)
  }

  return NextResponse.json({ matchId: null })
}

export async function GET(_req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const playerId = session.user.id
  const matchId = await redis.get<string>(`${MATCH_KEY_PREFIX}${playerId}`)
  if (matchId) {
    await redis.del(`${MATCH_KEY_PREFIX}${playerId}`)
    return NextResponse.json({ matchId })
  }
  return NextResponse.json({ matchId: null })
}
