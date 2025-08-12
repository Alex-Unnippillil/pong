import { describe, it, expect, vi } from 'vitest'

import { POST } from './route'
import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

const sessionMock = vi.mocked(getServerAuthSession)

describe('matchmaking API', () => {
  it('enqueues user when no opponent is available', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })
    vi.mocked(redis.lpop).mockResolvedValueOnce(null)

    const res = await POST(jsonRequest({}))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ queued: true })
    expect(redis.rpush).toHaveBeenCalledWith('matchmaking:queue', 'u1')
  })

  it('returns match details when opponent found', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u2' } })
    vi.mocked(redis.lpop).mockResolvedValueOnce('u1')

    const res = await POST(jsonRequest({}))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toMatchObject({
      p1: 'u1',
      p2: 'u2',
      matchId: expect.any(String),
    })
    expect(redis.set).toHaveBeenCalled()
  })

  it('returns 401 for unauthenticated users', async () => {
    sessionMock.mockResolvedValueOnce(null)

    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthenticated' })
    expect(redis.lpop).not.toHaveBeenCalled()
  })

  it('handles queue errors', async () => {
    sessionMock.mockResolvedValueOnce({ user: { id: 'u1' } })
    vi.mocked(redis.lpop).mockRejectedValueOnce(new Error('boom'))

    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'queue error' })
  })
})
