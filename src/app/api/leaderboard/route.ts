import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const data = await prisma.leaderboard.findMany({
      take: 10,
      orderBy: { elo: 'desc' },
      include: { user: true },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch leaderboard', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    )
  }
}
