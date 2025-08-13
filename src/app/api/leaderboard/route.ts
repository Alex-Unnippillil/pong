import { prisma } from '@/lib/prisma'
import { ok, error } from '@/lib/api-response'

export async function GET() {
  try {
    const data = await prisma.leaderboard.findMany({
      take: 10,
      orderBy: { elo: 'desc' },
      include: { user: true },
    })
    return ok(data)
  } catch {
    return error('server error', 500)
  }
}
