import { describe, expect, it, vi } from 'vitest'

vi.mock('./redis', () => ({
  redis: {
    publish: vi.fn(),
  },
}))

import { triggerLeaderboardRecalculation } from './leaderboard'
import { redis } from './redis'

describe('triggerLeaderboardRecalculation', () => {
  it('publishes recalc event and returns result', async () => {
    const publishResult = 1
    const publishMock = vi.mocked(redis.publish)
    publishMock.mockResolvedValue(publishResult)

    const result = await triggerLeaderboardRecalculation()

    expect(publishMock).toHaveBeenCalledWith('leaderboard:recalc', '')
    expect(result).toBe(publishResult)
  })
})
