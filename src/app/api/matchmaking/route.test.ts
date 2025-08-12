import { describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('../../../lib/redis', () => ({
  redis: {
    lpush: vi.fn(),
    rpop: vi.fn(),
  },
}))

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    match: { create: vi.fn() },
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

import { redis } from '../../../lib/redis'
import { prisma } from '../../../lib/prisma'
import { getServerAuthSession } from '../../../lib/auth'

describe('matchmaking API', () => {
  it('queues user when no opponent is available', async () => {
    getServerAuthSession.mockResolvedValue({ user: { id: 'u1' } })
    redis.rpop.mockResolvedValue(null)

    const res = await POST(new Request('http://localhost'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ queued: true })
    expect(redis.lpush).toHaveBeenCalledWith('matchmaking:queue', 'u1')
  })

  it('matches user with waiting opponent', async () => {
    getServerAuthSession.mockResolvedValue({ user: { id: 'u2' } })
    redis.rpop.mockResolvedValue('u1')
    prisma.match.create.mockResolvedValue({ id: 'm1' })

    const res = await POST(new Request('http://localhost'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ matchId: 'm1' })
    expect(prisma.match.create).toHaveBeenCalledWith({
      data: {
        mode: 'matchmaking',
        p1Id: 'u1',
        p2Id: 'u2',
        p1Score: 0,
        p2Score: 0,
      },
    })
  })
})
