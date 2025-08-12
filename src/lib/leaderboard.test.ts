import { describe, expect, it, vi } from 'vitest'

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from './redis'

vi.mock('./redis', () => ({
  redis: { publish: vi.fn() },
}))

describe('leaderboard', () => {
  it('publishes a recalculation message', () => {
    triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
