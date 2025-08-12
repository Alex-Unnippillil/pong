import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    match: { update: vi.fn() },
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }),
}))

import { POST } from './route'
import { prisma } from '../../../lib/prisma'

describe('score API', () => {
  it('updates match score', async () => {
    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 5,
      winnerId: 'p1',
    }

    const res = await POST(jsonRequest(body))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: {
        p1Score: 10,
        p2Score: 5,
        winnerId: 'p1',
        endedAt: expect.any(Date),
      },
    })
  })

  it('rejects invalid payload', async () => {
    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid' })
    expect(prisma.match.update).not.toHaveBeenCalled()
  })
})
