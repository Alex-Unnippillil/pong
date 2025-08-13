import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { triggerLeaderboardRecalculation } from '@/lib/leaderboard'
import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/api-response'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number().int().nonnegative(),
  p2Score: z.number().int().nonnegative(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthorized', 401)
  }
  const json = await req.json()
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return error('invalid', 400)
  }
  const { matchId, p1Score, p2Score } = parsed.data

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })
  if (!match) {
    return error('not-found', 404)
  }
  if (session.user.id !== match.p1Id && session.user.id !== match.p2Id) {
    return error('forbidden', 403)
  }
  if (match.endedAt) {
    return error('already-completed', 409)
  }

  if (p1Score === p2Score) {
    return error('invalid-score', 400)
  }

  const winnerId = p1Score > p2Score ? match.p1Id : match.p2Id

  await prisma.match.update({
    where: { id: matchId },
    data: { p1Score, p2Score, winnerId, endedAt: new Date() },
  })
  await triggerLeaderboardRecalculation()
  return ok({ ok: true })
}
