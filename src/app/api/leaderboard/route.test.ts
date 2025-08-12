import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    leaderboard: { findMany: vi.fn(async () => [{ elo: 100 }]) },
  },
}))

import { GET } from './route'
import { prisma } from '../../../lib/prisma'

describe('leaderboard API', () => {
  it('returns leaderboard', async () => {
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual([{ elo: 100 }])
  })

  it('handles errors', async () => {
    ;(prisma.leaderboard.findMany as any).mockRejectedValueOnce(
      new Error('fail'),
    )
    const res = await GET()
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ ok: false, error: 'server error' })
  })
})
