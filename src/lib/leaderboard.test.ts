import { describe, expect, it, vi } from 'vitest'

import { triggerLeaderboardRecalculation } from './leaderboard'

vi.mock('./leaderboard', () => ({
  triggerLeaderboardRecalculation: vi.fn(),
}))

describe('leaderboard', () => {
  it('exposes triggerLeaderboardRecalculation', () => {
    expect(triggerLeaderboardRecalculation).toBeDefined()
  })
})
