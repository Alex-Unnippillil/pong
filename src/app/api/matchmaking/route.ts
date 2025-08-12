import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

export async function POST(_req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const opponentId = await redis.lpop('matchmaking_queue')
  if (!opponentId) {
    await redis.rpush('matchmaking_queue', userId)
    return NextResponse.json({ status: 'queued' })
  }
  return NextResponse.json({ status: 'matched', opponentId })
}
