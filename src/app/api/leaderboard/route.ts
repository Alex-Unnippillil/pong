import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const data = await prisma.leaderboard.findMany({
      take: 10,
      orderBy: { elo: 'desc' },
      select: {
        elo: true,
        wins: true,
        losses: true,
        streak: true,
        user: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(data)
  } catch (_error) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
