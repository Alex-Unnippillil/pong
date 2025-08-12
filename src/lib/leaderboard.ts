import { redis } from '@/lib/redis'

/** Redis list used to queue leaderboard recomputation jobs. */
export const LEADERBOARD_RECALC_CHANNEL = 'leaderboard:recalc'

/**
 * Enqueue a job for leaderboard recalculation.
 *
 * The payload is intentionally minimal – a JSON encoded empty object – as the
 * worker that consumes this queue only needs a signal to perform a refresh.
 */
export async function triggerLeaderboardRecalculation() {
  const payload = JSON.stringify({})
  await redis.rpush(LEADERBOARD_RECALC_CHANNEL, payload)
}
