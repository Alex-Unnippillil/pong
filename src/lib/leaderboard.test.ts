import { describe, it, expect, vi } from 'vitest'

vi.mock('./prisma', () => ({
  prisma: {
    match: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { prisma } from './prisma'

describe('leaderboard recalculation', () => {
  it('updates wins and losses for single match', async () => {
    const upsertMock = vi.fn().mockResolvedValue(undefined)
    prisma.match.findMany.mockResolvedValue([
      {
        id: 'm1',
        p1Id: 'p1',
        p2Id: 'p2',
        p1Score: 10,
        p2Score: 5,
        winnerId: 'p1',
        endedAt: new Date(),
      },
    ])
    prisma.$transaction.mockImplementation(async (cb) => {
      await cb({ leaderboard: { upsert: upsertMock } })
    })

    await triggerLeaderboardRecalculation()

    const calls = upsertMock.mock.calls
    const p1Call = calls.find((c) => c[0].where.userId === 'p1')![0]
    const p2Call = calls.find((c) => c[0].where.userId === 'p2')![0]
    expect(p1Call.update).toMatchObject({ wins: 1, losses: 0 })
    expect(p1Call.create).toMatchObject({ wins: 1, losses: 0 })
    expect(p2Call.update).toMatchObject({ wins: 0, losses: 1 })
    expect(p2Call.create).toMatchObject({ wins: 0, losses: 1 })
  })

  it('aggregates multiple matches', async () => {
    const upsertMock = vi.fn().mockResolvedValue(undefined)
    prisma.match.findMany.mockResolvedValue([
      {
        id: 'm1',
        p1Id: 'p1',
        p2Id: 'p2',
        p1Score: 10,
        p2Score: 5,
        winnerId: 'p1',
        endedAt: new Date('2023-01-01'),
      },
      {
        id: 'm2',
        p1Id: 'p1',
        p2Id: 'p2',
        p1Score: 4,
        p2Score: 10,
        winnerId: 'p2',
        endedAt: new Date('2023-01-02'),
      },
    ])
    prisma.$transaction.mockImplementation(async (cb) => {
      await cb({ leaderboard: { upsert: upsertMock } })
    })

    await triggerLeaderboardRecalculation()

    const calls = upsertMock.mock.calls
    const p1Call = calls.find((c) => c[0].where.userId === 'p1')![0]
    const p2Call = calls.find((c) => c[0].where.userId === 'p2')![0]
    expect(p1Call.update).toMatchObject({ wins: 1, losses: 1 })
    expect(p2Call.update).toMatchObject({ wins: 1, losses: 1 })
  })
})
