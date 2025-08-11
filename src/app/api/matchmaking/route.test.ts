import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

vi.mock('../../../lib/redis', () => ({
  redis: {
    lpush: vi.fn(),
  },
}))

import { redis } from '../../../lib/redis'

describe('matchmaking API', () => {
  it('enqueues request and returns room id', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ roomId: '4fzzzxjy' })
    expect(redis.lpush).toHaveBeenCalledWith('queue', '4fzzzxjy')
  })
})
