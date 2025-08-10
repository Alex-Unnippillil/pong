import { Redis } from '@upstash/redis'

// Redis keys
export const MATCHMAKING_QUEUE = 'matchmaking:queue'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})
