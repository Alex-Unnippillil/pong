import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request) {
  try {
    const data = await prisma.leaderboard.findMany({
      take: 10,
      orderBy: { elo: 'desc' },
      include: { user: true },
    })
    return NextResponse.json(data)
  } catch (err) {
    console.error('leaderboard fetch failed', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
