import { vi, describe, it, expect } from 'vitest'

// Mock redis to avoid real network calls and to verify publish is invoked correctly
vi.mock('@/lib/redis', () => ({
  redis: {
    publish: vi.fn().mockResolvedValue(undefined),
  },
}))

import { triggerLeaderboardRecalculation } from '@/lib/leaderboard'
import { redis } from '@/lib/redis'

describe('triggerLeaderboardRecalculation', () => {
  it('publishes a leaderboard recalculation event', async () => {
    await triggerLeaderboardRecalculation()
    expect(redis.publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
