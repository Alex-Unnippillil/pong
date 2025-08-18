import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/api-response'
import type { Prisma } from '@prisma/client'

export const leaderboardQueryOptions = {
  take: 10,
  orderBy: { elo: 'desc' },
  include: { user: true },
} satisfies Prisma.LeaderboardFindManyArgs

export async function GET() {
  try {
    const result = await prisma.leaderboard.findMany(leaderboardQueryOptions)
    return ok(result)
  } catch {
    return error('server error', 500)
  }
}
