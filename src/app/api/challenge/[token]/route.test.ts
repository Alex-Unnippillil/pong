import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../../lib/prisma', () => ({
  prisma: { match: { update: vi.fn() } },
}))

import { GET } from './route'
import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

const sessionMock = vi.mocked(getServerAuthSession)

describe('challenge accept API', () => {
  it('assigns p2 and returns matchId', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'p2' } })
    vi.mocked(redis.get).mockResolvedValueOnce(
      JSON.stringify({ matchId: 'm1', p1Id: 'p1' }),
    )

    const res = await GET(new Request('http://localhost/api'), {
      params: { token: 'tok' },
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ matchId: 'm1' })
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { p2Id: 'p2' },
    })
    expect(redis.set).toHaveBeenCalledWith(
      'match:m1',
      JSON.stringify({ p1: 'p1', p2: 'p2' }),
    )
    expect(redis.del).toHaveBeenCalledWith('challenge:tok')
  })

  it('returns 404 for invalid token', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'p2' } })
    vi.mocked(redis.get).mockResolvedValueOnce(null)

    const res = await GET(new Request('http://localhost/api'), {
      params: { token: 'bad' },
    })

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'invalid token' })
    expect(prisma.match.update).not.toHaveBeenCalled()
  })
})
