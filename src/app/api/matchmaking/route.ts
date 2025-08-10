import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export const runtime = 'edge'

export async function POST() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const opponentId = await redis.rpop('matchmaking')

  if (opponentId) {
    const roomId = [userId, opponentId].sort().join(':')
    await redis.lpush(
      `match:${opponentId}`,
      JSON.stringify({ roomId, opponentId: userId }),
    )
    return NextResponse.json({ roomId, opponentId })
  }

  await redis.lpush('matchmaking', userId)
  const [, data] = await redis.brpop(`match:${userId}`, 0)
  return NextResponse.json(JSON.parse(data))
}
