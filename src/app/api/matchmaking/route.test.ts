import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { match: { create: vi.fn() } },
}))

import { POST } from './route'
import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

const sessionMock = vi.mocked(getServerAuthSession)

describe('matchmaking API', () => {
  it('enqueues user when no opponent is available', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })
    vi.mocked(redis.lpop).mockResolvedValueOnce(null)

    const res = await POST(jsonRequest({ mode: 'classic' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ queued: true })
    expect(redis.rpush).toHaveBeenCalledWith('matchmaking:queue', 'u1')
  })

  it('creates match and returns details when opponent found', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u2' } })
    vi.mocked(redis.lpop).mockResolvedValueOnce('u1')
    vi.mocked(prisma.match.create).mockResolvedValueOnce({ id: 'm1' } as any)

    const res = await POST(jsonRequest({ mode: 'classic' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ p1: 'u1', p2: 'u2', matchId: 'm1' })
    expect(prisma.match.create).toHaveBeenCalledWith({
      data: { p1Id: 'u1', p2Id: 'u2', mode: 'classic', p1Score: 0, p2Score: 0 },
    })
    expect(redis.set).toHaveBeenCalledWith(
      'match:m1',
      JSON.stringify({ p1: 'u1', p2: 'u2' }),
    )
  })

  it('defaults mode to classic when omitted', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u2' } })
    vi.mocked(redis.lpop).mockResolvedValueOnce('u1')
    vi.mocked(prisma.match.create).mockResolvedValueOnce({ id: 'm1' } as any)

    const res = await POST(jsonRequest({}))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ p1: 'u1', p2: 'u2', matchId: 'm1' })
    expect(prisma.match.create).toHaveBeenCalledWith({
      data: { p1Id: 'u1', p2Id: 'u2', mode: 'classic', p1Score: 0, p2Score: 0 },
    })
  })

  it('returns 401 for unauthenticated users', async () => {
    sessionMock.mockResolvedValueOnce(null)

    const res = await POST(jsonRequest({ mode: 'classic' }))

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthenticated' })
    expect(redis.lpop).not.toHaveBeenCalled()
  })

  it('handles queue errors', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })
    vi.mocked(redis.lpop).mockRejectedValueOnce(new Error('boom'))

    const res = await POST(jsonRequest({ mode: 'classic' }))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'queue error' })
  })

  it('rejects invalid modes', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })

    const res = await POST(jsonRequest({ mode: 'invalid' }))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid mode' })
    expect(redis.lpop).not.toHaveBeenCalled()
  })
})
