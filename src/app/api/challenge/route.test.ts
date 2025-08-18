import { describe, it, expect, vi } from 'vitest'
import crypto from 'crypto'

vi.mock('@/lib/prisma', () => ({
  prisma: { match: { create: vi.fn() } },
}))

import { POST } from './route'
import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

const sessionMock = vi.mocked(getServerAuthSession)

describe('challenge create API', () => {
  it('creates match and returns token', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })
    vi.mocked(prisma.match.create).mockResolvedValueOnce({
      id: 'm1',
    } as unknown as { id: string })
    vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('t1')

    const res = await POST(new Request('http://localhost/api'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ token: 't1' })
    expect(prisma.match.create).toHaveBeenCalledWith({
      data: { p1Id: 'u1', mode: 'classic', p1Score: 0, p2Score: 0 },
    })
    expect(redis.set).toHaveBeenCalledWith(
      'challenge:t1',
      JSON.stringify({ matchId: 'm1', p1Id: 'u1' }),
    )
  })

  it('returns 401 for unauthenticated users', async () => {
    sessionMock.mockResolvedValueOnce(null)

    const res = await POST(new Request('http://localhost/api'))

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthenticated' })
    expect(prisma.match.create).not.toHaveBeenCalled()
  })
})
