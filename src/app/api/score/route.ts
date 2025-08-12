import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { triggerLeaderboardRecalculation } from '@/lib/leaderboard'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number().int().nonnegative(),
  p2Score: z.number().int().nonnegative(),
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
  const { matchId, p1Score, p2Score } = parsed.data

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })
  if (!match) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }
  if (session.user.id !== match.p1Id && session.user.id !== match.p2Id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (match.endedAt) {
    return NextResponse.json({ error: 'already-completed' }, { status: 409 })
  }

  if (p1Score === p2Score) {
    return NextResponse.json({ error: 'invalid-score' }, { status: 400 })
  }

  const winnerId = p1Score > p2Score ? match.p1Id : match.p2Id

  await prisma.match.update({
    where: { id: matchId },
    data: { p1Score, p2Score, winnerId, endedAt: new Date() },
  })
  await triggerLeaderboardRecalculation()
  return NextResponse.json({ ok: true })
}
