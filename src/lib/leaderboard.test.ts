import { describe, expect, it, vi } from 'vitest'

vi.mock('./redis', () => ({
  redis: {
    publish: vi.fn(),
  },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from './redis'

describe('triggerLeaderboardRecalculation', () => {
  it('publishes leaderboard:recalc to redis', async () => {
    await triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
