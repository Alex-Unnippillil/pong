import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    match: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

vi.mock('../../../lib/leaderboard', () => ({
  triggerLeaderboardRecalculation: vi.fn(),
}))

import { prisma } from '../../../lib/prisma'
import { getServerAuthSession } from '../../../lib/auth'
import { triggerLeaderboardRecalculation } from '../../../lib/leaderboard'
import { POST } from './route'

describe('score API', () => {
  it('updates match score', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p1' } })
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      p1Id: 'p1',
      p2Id: 'p2',
      endedAt: null,
    })

    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 5,
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
    expect(triggerLeaderboardRecalculation).toHaveBeenCalled()
  })

  it('rejects invalid payload', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p1' } })

    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid' })
    expect(prisma.match.findUnique).not.toHaveBeenCalled()
    expect(prisma.match.update).not.toHaveBeenCalled()
    expect(triggerLeaderboardRecalculation).not.toHaveBeenCalled()
  })

  it('rejects unauthorized player', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p3' } })
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      p1Id: 'p1',
      p2Id: 'p2',
      endedAt: null,
    })

    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 5,
    }

    const res = await POST(jsonRequest(body))

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: 'forbidden' })
    expect(prisma.match.update).not.toHaveBeenCalled()
    expect(triggerLeaderboardRecalculation).not.toHaveBeenCalled()
  })

  it('rejects already completed match', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p1' } })
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      p1Id: 'p1',
      p2Id: 'p2',
      endedAt: new Date(),
    })

    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 5,
    }

    const res = await POST(jsonRequest(body))

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'already-completed' })
    expect(prisma.match.update).not.toHaveBeenCalled()
    expect(triggerLeaderboardRecalculation).not.toHaveBeenCalled()
  })

  it('rejects tie score', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p1' } })
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      p1Id: 'p1',
      p2Id: 'p2',
      endedAt: null,
    })

    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 10,
    }

    const res = await POST(jsonRequest(body))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid-score' })
    expect(prisma.match.update).not.toHaveBeenCalled()
    expect(triggerLeaderboardRecalculation).not.toHaveBeenCalled()
  })

  it('returns 500 on update failure', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: 'p1' } })
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      p1Id: 'p1',
      p2Id: 'p2',
      endedAt: null,
    })

    const body = {
      matchId: 'm1',
      p1Score: 10,
      p2Score: 5,
    }
    vi.mocked(prisma.match.update).mockRejectedValueOnce(new Error('fail'))
    const res = await POST(jsonRequest(body))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json).toEqual({ error: 'server error' })
    expect(triggerLeaderboardRecalculation).not.toHaveBeenCalled()
  })
})
