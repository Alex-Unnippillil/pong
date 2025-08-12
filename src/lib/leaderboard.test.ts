import { describe, it, expect } from 'vitest'

import {
  triggerLeaderboardRecalculation,
  LEADERBOARD_RECALC_CHANNEL,
} from './leaderboard'
import { redis } from '@/lib/redis'

describe('triggerLeaderboardRecalculation', () => {
  it('enqueues a leaderboard recalculation job', async () => {
    await triggerLeaderboardRecalculation()
    expect(redis.rpush).toHaveBeenCalledWith(
      LEADERBOARD_RECALC_CHANNEL,
      JSON.stringify({}),
    )
  })
})
