import { Redis } from '@upstash/redis'

const { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } = process.env

if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
  throw new Error('UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN must be set')
}

export const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN,
})
