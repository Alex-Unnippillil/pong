import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaderboard: {
      findMany: vi.fn(),
    },
  },
}))

import { GET } from './route'
import { prisma } from '@/lib/prisma'

describe('leaderboard API', () => {
  it('returns leaderboard entries', async () => {
    const sample = [
      { id: '1', elo: 1000, user: { id: 'u1', name: 'Alice' } },
      { id: '2', elo: 900, user: { id: 'u2', name: 'Bob' } },
    ]

    prisma.leaderboard.findMany.mockResolvedValue(sample as any)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(sample)
  })

  it('returns 500 on query failure', async () => {
    prisma.leaderboard.findMany.mockRejectedValue(new Error('boom'))

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'server error' })
  })
})
