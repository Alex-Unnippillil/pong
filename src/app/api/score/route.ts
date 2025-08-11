import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyMatch } from '@/lib/elo'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number(),
  p2Score: z.number(),
  winnerId: z.string(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const json = await req.json()
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  const { matchId, p1Score, p2Score, winnerId } = parsed.data
  await prisma.$transaction(async (tx) => {
    const match = await tx.match.update({
      where: { id: matchId },
      data: { p1Score, p2Score, winnerId, endedAt: new Date() },
    })
    const players = [match.p1Id, match.p2Id].filter(Boolean) as string[]
    const leaderboards = await tx.leaderboard.findMany({
      where: { userId: { in: players } },
    })
    const p1Board = leaderboards.find((l) => l.userId === match.p1Id)!
    const p2Board = leaderboards.find((l) => l.userId === match.p2Id)!
    const winner = winnerId === match.p1Id ? 'p1' : 'p2'
    const { p1, p2 } = applyMatch(p1Board, p2Board, winner)
    await Promise.all([
      tx.leaderboard.update({ where: { userId: match.p1Id }, data: p1 }),
      tx.leaderboard.update({ where: { userId: match.p2Id! }, data: p2 }),
    ])
  })
  return NextResponse.json({ ok: true })
}
