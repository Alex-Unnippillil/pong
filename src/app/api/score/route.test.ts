import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    match: { update: vi.fn() },
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(() => Promise.resolve({ user: {} })),
}))

import { POST } from './route'
import { prisma } from '../../../lib/prisma'
import { getServerAuthSession } from '../../../lib/auth'

describe('score API', () => {
  const body = {
    matchId: 'm1',
    p1Score: 10,
    p2Score: 5,
    winnerId: 'p1',
  }

  it('updates match score', async () => {
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
    expect(await res.json()).toEqual({ ok: false, error: 'invalid' })
    expect(prisma.match.update).not.toHaveBeenCalled()
  })

  it('requires auth', async () => {
    ;(getServerAuthSession as any).mockResolvedValueOnce(null)
    const res = await POST(jsonRequest(body))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, error: 'unauthorized' })
  })
})
