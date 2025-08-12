import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking:queue'

export async function POST() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const opponentId = await redis.rpop<string>(QUEUE_KEY)

  if (opponentId && opponentId !== userId) {
    const match = await prisma.match.create({
      data: {
        mode: 'matchmaking',
        p1Id: opponentId,
        p2Id: userId,
        p1Score: 0,
        p2Score: 0,
      },
    })
    return NextResponse.json({ matchId: match.id })
  }

  if (opponentId) {
    await redis.lpush(QUEUE_KEY, opponentId)
  }

  await redis.lpush(QUEUE_KEY, userId)
  return NextResponse.json({ queued: true })
}
