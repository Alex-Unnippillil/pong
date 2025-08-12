import { prisma } from './prisma'

interface Stats {
  elo: number
  wins: number
  losses: number
  streak: number
}

const K = 32

export async function triggerLeaderboardRecalculation() {
  const matches = await prisma.match.findMany({
    where: { endedAt: { not: null } },
    orderBy: { endedAt: 'asc' },
  })

  const stats = new Map<string, Stats>()

  const getStats = (userId: string): Stats => {
    let s = stats.get(userId)
    if (!s) {
      s = { elo: 1000, wins: 0, losses: 0, streak: 0 }
      stats.set(userId, s)
    }
    return s
  }

  for (const match of matches) {
    if (!match.p2Id || !match.winnerId) continue

    const p1 = getStats(match.p1Id)
    const p2 = getStats(match.p2Id)

    const expected1 = 1 / (1 + Math.pow(10, (p2.elo - p1.elo) / 400))
    const expected2 = 1 - expected1
    const p1Win = match.winnerId === match.p1Id
    const s1 = p1Win ? 1 : 0
    const s2 = 1 - s1

    p1.elo = Math.round(p1.elo + K * (s1 - expected1))
    p2.elo = Math.round(p2.elo + K * (s2 - expected2))

    if (p1Win) {
      p1.wins++
      p1.streak = p1.streak >= 0 ? p1.streak + 1 : 1
      p2.losses++
      p2.streak = p2.streak <= 0 ? p2.streak - 1 : -1
    } else {
      p2.wins++
      p2.streak = p2.streak >= 0 ? p2.streak + 1 : 1
      p1.losses++
      p1.streak = p1.streak <= 0 ? p1.streak - 1 : -1
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const [userId, data] of stats) {
      await tx.leaderboard.upsert({
        where: { userId },
        update: {
          elo: data.elo,
          wins: data.wins,
          losses: data.losses,
          streak: data.streak,
        },
        create: {
          userId,
          elo: data.elo,
          wins: data.wins,
          losses: data.losses,
          streak: data.streak,
        },
      })
    }
  })
}
