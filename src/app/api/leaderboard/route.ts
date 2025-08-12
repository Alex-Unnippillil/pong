import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.leaderboard.findMany({
    take: 10,
    orderBy: { elo: 'desc' },
    select: {
      userId: true,
      elo: true,
      wins: true,
      losses: true,
      user: { select: { id: true, name: true } },
    },
  })
  return NextResponse.json(data)
}
