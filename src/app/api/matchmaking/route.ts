import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'edge'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  try {
    const allowed = await rateLimit(`matchmaking:${ip}`, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
  } catch (err) {
    console.error('Rate limit failed for matchmaking', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }

  const roomId = Math.random().toString(36).slice(2, 10)
  try {
    await redis.lpush('queue', roomId)
    return NextResponse.json({ roomId })
  } catch (err) {
    console.error('Failed to enqueue matchmaking request', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
