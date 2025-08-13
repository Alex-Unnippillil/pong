import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/api-response'

export const leaderboardQueryOptions = {
  take: 10,
  orderBy: { elo: 'desc' },
  include: { user: true },
} as const

export async function GET() {
  try {

  } catch {
    return error('server error', 500)
  }
}
