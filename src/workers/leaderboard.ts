import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

interface Stats {
  elo: number
  wins: number
  losses: number
  streak: number
}

async function recomputeLeaderboard() {
  const matches = await prisma.match.findMany({
    select: { p1Id: true, p2Id: true, winnerId: true, startedAt: true },
    orderBy: { startedAt: 'asc' },
  })

  const stats = new Map<string, Stats>()

  const get = (id: string): Stats => {
    let s = stats.get(id)
    if (!s) {
      s = { elo: 1000, wins: 0, losses: 0, streak: 0 }
      stats.set(id, s)
    }
    return s
  }

  for (const m of matches) {
    if (!m.p2Id) continue
    const p1 = get(m.p1Id)
    const p2 = get(m.p2Id)

    const expected1 = 1 / (1 + 10 ** ((p2.elo - p1.elo) / 400))
    const expected2 = 1 / (1 + 10 ** ((p1.elo - p2.elo) / 400))
    const score1 = m.winnerId === m.p1Id ? 1 : 0
    const score2 = m.winnerId === m.p2Id ? 1 : 0
    const K = 32
    p1.elo = Math.round(p1.elo + K * (score1 - expected1))
    p2.elo = Math.round(p2.elo + K * (score2 - expected2))

    if (score1 === 1) {
      p1.wins++
      p2.losses++
      p1.streak = p1.streak >= 0 ? p1.streak + 1 : 1
      p2.streak = p2.streak <= 0 ? p2.streak - 1 : -1
    } else {
      p1.losses++
      p2.wins++
      p1.streak = p1.streak <= 0 ? p1.streak - 1 : -1
      p2.streak = p2.streak >= 0 ? p2.streak + 1 : 1
    }
  }

  const ops = Array.from(stats.entries()).map(([userId, s]) =>
    prisma.leaderboard.upsert({
      where: { userId },
      update: {
        elo: Math.round(s.elo),
        wins: s.wins,
        losses: s.losses,
        streak: s.streak > 0 ? s.streak : 0,
      },
      create: {
        userId,
        elo: Math.round(s.elo),
        wins: s.wins,
        losses: s.losses,
        streak: s.streak > 0 ? s.streak : 0,
      },
    }),
  )

  await prisma.$transaction(ops)
}

interface AnalyticsGlobal {
  Sentry?: {
    captureException: (
      err: unknown,
      options?: { extra?: Record<string, unknown> },
    ) => void
  }
  posthog?: {
    capture: (data: {
      distinctId: string
      event: string
      properties: Record<string, unknown>
    }) => void
  }
}

function reportError(err: unknown, context?: Record<string, unknown>) {
  const g = globalThis as AnalyticsGlobal
  if (g.Sentry?.captureException) {
    g.Sentry.captureException(err, { extra: context })
  }
  if (g.posthog?.capture) {
    g.posthog.capture({
      distinctId: 'leaderboard-worker',
      event: 'leaderboard_recalc_error',
      properties: { ...context, error: (err as Error).message },
    })
  }
}

async function main() {
  if (!redis) {
    console.warn(
      'Redis not configured, real-time leaderboard updates are disabled',
    )
  }
  try {
    await recomputeLeaderboard()
    console.log('Recomputed leaderboard')
  } catch (err) {
    console.error('Failed to recompute leaderboard', err)
    reportError(err)
  }
  if (!redis) {
    return
  }
  const sub = await redis.subscribe('leaderboard:recalc')
  console.log('Subscribed to leaderboard:recalc')
  sub.on('message', async (_, message) => {
    const ctx = { matchId: message }
    try {
      await recomputeLeaderboard()
      console.log('Recomputed leaderboard', ctx)
    } catch (err) {
      console.error('Failed to recompute leaderboard', ctx, err)
      reportError(err, ctx)
    }
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
