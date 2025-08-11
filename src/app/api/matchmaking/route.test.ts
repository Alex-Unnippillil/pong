import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST, STALE_THRESHOLD_MS } from './route'
import { redis } from '../../../lib/redis'

vi.mock('../../../lib/redis', () => ({
  redis: {
    zadd: vi.fn(),
    zremrangebyscore: vi.fn(),
    zpopmin: vi.fn().mockResolvedValue([]),
    expire: vi.fn(),
  },
}))

describe('matchmaking route', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('removes stale queue entries before matching', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ playerId: 'p1' }),
      headers: { 'content-type': 'application/json' },
    })

    await POST(req)

    const now = Date.now()
    expect(redis.zremrangebyscore).toHaveBeenCalledWith(
      'matchmaking:queue',
      0,
      now - STALE_THRESHOLD_MS,
    )
  })
})
