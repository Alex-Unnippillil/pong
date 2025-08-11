import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

export async function POST() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  // Placeholder: push request into queue and return mock room id
  const roomId = Math.random().toString(36).slice(2, 10)
  await redis.lpush('queue', roomId)
  return NextResponse.json({ roomId })
}
