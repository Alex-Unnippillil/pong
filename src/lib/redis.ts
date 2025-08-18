import { Redis } from '@upstash/redis'

import { env } from '@/lib/env.server'

let redis: Redis | null = null

if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({
    url: env.UPSTASH_REDIS_URL,
    token: env.UPSTASH_REDIS_TOKEN,
  })
} else {
  console.warn(
    'Redis disabled: missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN',
  )
}

export { redis }
