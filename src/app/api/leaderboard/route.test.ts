/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: { leaderboard: { findMany: vi.fn() } },
}))

import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('GET /api/leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns leaderboard data', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.leaderboard.findMany).mockResolvedValue([
      {
        elo: 1000,
        wins: 1,
        losses: 0,
        streak: 1,
        user: { id: '1', name: 'Alice' },
      },
    ])
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual([
      {
        elo: 1000,
        wins: 1,
        losses: 0,
        streak: 1,
        user: { id: '1', name: 'Alice' },
      },
    ])
  })

  it('returns 401 when unauthorized', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 500 on db error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.leaderboard.findMany).mockRejectedValue(new Error('db'))
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
