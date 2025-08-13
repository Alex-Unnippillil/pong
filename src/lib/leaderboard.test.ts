import { describe, it, expect, vi } from 'vitest'

vi.mock('./redis', () => ({
  redis: {
    publish: vi.fn(),
  },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from './redis'

describe('leaderboard', () => {
  it('triggers recalculation', async () => {
    await triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
