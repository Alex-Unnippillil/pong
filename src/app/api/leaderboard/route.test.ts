import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    leaderboard: { findMany: vi.fn() },
  },
}))

import { GET } from './route'
import { prisma } from '../../../lib/prisma'

describe('leaderboard API', () => {
  it('returns top leaderboard entries', async () => {
    const entries = [{ id: '1', elo: 1200 }]
    ;(prisma.leaderboard.findMany as any).mockResolvedValue(entries)
    const res = await GET(jsonRequest(undefined, { method: 'GET' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual(entries)
  })

  it('handles database errors', async () => {
    ;(prisma.leaderboard.findMany as any).mockRejectedValue(new Error('db'))
    const res = await GET(jsonRequest(undefined, { method: 'GET' }))
    const json = await res.json()
    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'server error' })
  })
})
