import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/redis', () => ({
  redis: {
    publish: vi.fn(),
  },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from '@/lib/redis'

describe('triggerLeaderboardRecalculation', () => {
  it('publishes timestamp to redis channel', async () => {
    await triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith(
      'leaderboard:recalc',
      expect.any(String),
    )
  })
})
