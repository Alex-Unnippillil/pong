import { redis } from '@/lib/redis'

export async function triggerLeaderboardRecalculation() {
  // enqueue a timestamp so a worker can recompute the leaderboard
  await redis.publish('leaderboard:recalc', Date.now().toString())
}
