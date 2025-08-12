import { redis } from '@/lib/redis'

export function triggerLeaderboardRecalculation() {
  return redis.publish('leaderboard:recalc', '')
}
