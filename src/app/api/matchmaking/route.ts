import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis, MATCHMAKING_QUEUE } from '@/lib/redis'

export async function POST() {
  try {
    const players = await redis.lpop<string[]>(MATCHMAKING_QUEUE, 2)
    if (!players || players.length < 2) {
      return NextResponse.json(
        { error: 'not enough players in queue' },
        { status: 400 },
      )
    }

    const [p1Id, p2Id] = players
    const match = await prisma.match.create({
      data: {
        mode: 'ranked',
        p1Id,
        p2Id,
        p1Score: 0,
        p2Score: 0,
      },
    })

    return NextResponse.json({
      matchId: match.id,
      roles: {
        [p1Id]: 'p1',
        [p2Id]: 'p2',
      },
    })
  } catch (err) {
    console.error('matchmaking POST error', err)
    return NextResponse.json(
      { error: 'failed to create match' },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 })
    }

    const match = await prisma.match.findFirst({
      where: {
        OR: [{ p1Id: playerId }, { p2Id: playerId }],
        endedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    })

    if (!match) {
      return NextResponse.json({ status: 'pending' }, { status: 404 })
    }

    const role = match.p1Id === playerId ? 'p1' : 'p2'
    return NextResponse.json({ matchId: match.id, role })
  } catch (err) {
    console.error('matchmaking GET error', err)
    return NextResponse.json(
      { error: 'failed to fetch match' },
      { status: 500 },
    )
  }
}
