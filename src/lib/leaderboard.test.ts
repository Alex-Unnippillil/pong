import { describe, expect, it, vi } from 'vitest'

vi.mock('./redis', () => ({
  redis: { publish: vi.fn() },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from './redis'

describe('leaderboard utilities', () => {
  it('triggers leaderboard recalculation', () => {
    triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
