import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/api-response'

export const leaderboardQueryOptions = {
  take: 10,
  orderBy: { elo: 'desc' },
  include: { user: true },
} as const

export async function GET() {
  try {
    const data = await prisma.leaderboard.findMany(leaderboardQueryOptions)
    return ok(data)
  } catch {
    return error('server error', 500)
  }
}
