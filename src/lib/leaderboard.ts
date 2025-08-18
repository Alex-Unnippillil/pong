import { redis } from '@/lib/redis'

export function triggerLeaderboardRecalculation() {
  if (!redis) {
    return
  }

  return redis.publish('leaderboard:recalc', '')
}
