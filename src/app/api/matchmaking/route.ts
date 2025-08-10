import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'edge'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    // Placeholder: push request into queue and return mock room id
    const roomId = Math.random().toString(36).slice(2, 10)
    await redis.lpush('queue', roomId)
    return NextResponse.json({ roomId })
  } catch (_error) {
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
