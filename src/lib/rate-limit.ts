import { redis } from './redis'

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds = 60,
): Promise<boolean> {
  const key = `rl:${identifier}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }
    return count <= limit
  } catch (err) {
    console.error('Rate limit check failed', err)
    throw err
  }
}
