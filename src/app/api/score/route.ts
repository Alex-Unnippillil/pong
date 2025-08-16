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

}
