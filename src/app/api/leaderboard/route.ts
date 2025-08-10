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
  } catch (err) {
    console.error('Failed to fetch leaderboard', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
