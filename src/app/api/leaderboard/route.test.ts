import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    leaderboard: {
      findMany: vi.fn(),
    },
  },
}))

import { GET } from './route'
import { prisma } from '../../../lib/prisma'

describe('leaderboard API', () => {
  it('omits user emails', async () => {
    const mockData = [
      {
        userId: 'u1',
        elo: 1000,
        wins: 5,
        losses: 1,
        user: { id: 'u1', name: 'Alice' },
      },
    ]
    prisma.leaderboard.findMany.mockResolvedValue(mockData)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(mockData)
    expect(json[0].user.email).toBeUndefined()
    expect(prisma.leaderboard.findMany).toHaveBeenCalledWith({
      take: 10,
      orderBy: { elo: 'desc' },
      select: {
        userId: true,
        elo: true,
        wins: true,
        losses: true,
        user: { select: { id: true, name: true } },
      },
    })
  })
})
