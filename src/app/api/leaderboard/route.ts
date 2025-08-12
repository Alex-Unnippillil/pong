import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { error } from '@/utils/api'

export async function GET() {
  try {
    const data = await prisma.leaderboard.findMany({
      take: 10,
      orderBy: { elo: 'desc' },
      include: { user: true },
    })
    return NextResponse.json(data)
  } catch {
    return error(500, 'server error')
  }
}
