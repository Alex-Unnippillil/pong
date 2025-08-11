import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

const QUEUE_KEY = 'matchmaking:queue'
export const STALE_THRESHOLD_MS = 30_000
const QUEUE_TTL_SECONDS = 60

export async function POST(req: Request) {
  const { playerId } = await req.json()
  const now = Date.now()

  await redis.zadd(QUEUE_KEY, { score: now, member: playerId })

  const staleBefore = now - STALE_THRESHOLD_MS
  await redis.zremrangebyscore(QUEUE_KEY, 0, staleBefore)
  await redis.expire(QUEUE_KEY, QUEUE_TTL_SECONDS)

  type ZPopMinResult = string | { member: string; score: number }
  const popped = (await redis.zpopmin(QUEUE_KEY, 2)) as ZPopMinResult[]

  let players: string[] = []
  if (popped.length && typeof popped[0] === 'string') {
    for (let i = 0; i < popped.length; i += 2) {
      players.push(popped[i] as string)
    }
  } else {
    players = (popped as { member: string }[]).map((p) => p.member)
  }

  if (players.length < 2) {
    if (players.length === 1) {
      await redis.zadd(QUEUE_KEY, { score: now, member: players[0] })
    }
    return NextResponse.json({ status: 'queued' })
  }

  const [a, b] = players
  const roomId = crypto.randomUUID()
  const opponentId = a === playerId ? b : a

  return NextResponse.json({ roomId, opponentId })
}
