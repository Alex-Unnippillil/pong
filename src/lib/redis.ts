import { Redis } from '@upstash/redis'

import { env } from '@/lib/env.server'

function createNoopRedis(): Redis {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'subscribe') {
          return async () => ({ on: () => {} })
        }
        switch (prop) {
          case 'incr':
          case 'rpush':
          case 'expire':
          case 'publish':
            return async () => 0
          case 'set':
            return async () => 'OK'
          case 'lpop':
          case 'lpos':
            return async () => null
          default:
            return async () => undefined
        }
      },
    },
  ) as Redis
}

export const redis =
  env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN,
      })
    : (() => {
        console.warn(
          'Redis disabled: missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN',
        )
        return createNoopRedis()
      })()
