import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

export async function POST() {
  // Placeholder: push request into queue and return mock room id
  const roomId = Math.random().toString(36).slice(2, 10)
  await redis.lpush('queue', roomId)
  return NextResponse.json({ roomId })
}
