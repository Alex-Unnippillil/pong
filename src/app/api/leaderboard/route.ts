import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.leaderboard.findMany({
    take: 10,
    orderBy: { elo: 'desc' },
    include: { user: true },
  })
  return NextResponse.json(data)
}
