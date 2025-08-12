import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

vi.mock('../../../lib/redis', () => ({
  redis: {
    lpop: vi.fn(),
    rpush: vi.fn(),
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

import { redis } from '../../../lib/redis'
import { getServerAuthSession } from '../../../lib/auth'

const redisMock = vi.mocked(redis)
const authMock = vi.mocked(getServerAuthSession)

describe('matchmaking API', () => {
  it('queues user when no opponent', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } } as any)
    redisMock.lpop.mockResolvedValue(null)

    const res = await POST()
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ queued: true })
    expect(redisMock.rpush).toHaveBeenCalledWith('matchmaking_queue', 'u1')
  })

  it('matches with waiting user', async () => {
    authMock.mockResolvedValue({ user: { id: 'u2' } } as any)
    redisMock.lpop.mockResolvedValue('u1')

    const res = await POST()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.players).toEqual(['u1', 'u2'])
    expect(typeof json.id).toBe('string')
    expect(redisMock.rpush).not.toHaveBeenCalled()
  })

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null)

    const res = await POST()
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
  })

  it('returns 500 on redis error', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } } as any)
    redisMock.lpop.mockRejectedValue(new Error('oops'))

    const res = await POST()
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'queue_failed' })
  })
})
