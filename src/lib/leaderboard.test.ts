import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/redis', () => ({
  redis: { publish: vi.fn() },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from '@/lib/redis'

describe('leaderboard lib', () => {
  it('publishes recalculation event', () => {
    triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
