import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/redis', () => ({
  redis: {
    lpop: vi.fn(),
    rpush: vi.fn(),
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

import { POST } from './route'
import { redis } from '../../../lib/redis'
import { getServerAuthSession } from '../../../lib/auth'

describe('matchmaking API', () => {
  it('queues user when no opponent', async () => {
    ;(getServerAuthSession as any).mockResolvedValue({ user: { id: 'u1' } })
    ;(redis.lpop as any).mockResolvedValue(null)
    const res = await POST(jsonRequest({}))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ status: 'queued' })
    expect(redis.rpush).toHaveBeenCalledWith('matchmaking_queue', 'u1')
  })

  it('matches with existing opponent', async () => {
    ;(getServerAuthSession as any).mockResolvedValue({ user: { id: 'u2' } })
    ;(redis.lpop as any).mockResolvedValue('u1')
    const res = await POST(jsonRequest({}))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ status: 'matched', opponentId: 'u1' })
    expect(redis.rpush).not.toHaveBeenCalled()
  })

  it('requires authentication', async () => {
    ;(getServerAuthSession as any).mockResolvedValue(null)
    const res = await POST(jsonRequest({}))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
  })
})
