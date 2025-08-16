import { describe, expect, it, vi } from 'vitest'

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from '@/lib/redis'

vi.mock('@/lib/redis', () => ({
  redis: { publish: vi.fn() },
}))

describe('triggerLeaderboardRecalculation', () => {
  it('publishes to the leaderboard channel', async () => {
    const publish = vi.mocked(redis.publish)
    await triggerLeaderboardRecalculation()
    expect(publish).toHaveBeenCalledWith('leaderboard:recalc', '')
  })
})
