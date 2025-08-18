import { Redis } from '@upstash/redis'

import { env } from '@/lib/env.server'

if (!env.UPSTASH_REDIS_URL || !env.UPSTASH_REDIS_TOKEN) {
  console.warn(
    'Redis disabled: missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN',
  )
}

export const redis: Redis | null =
  env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN,
      })
    : null
