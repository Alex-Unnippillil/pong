import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { ok, error } from '@/lib/api-response'

export const telemetrySchema = z.object({
  eventType: z.string(),
  payload: z
    .custom<Record<string, unknown>>(
      (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
    )
    .refine((val) => Object.keys(val).length <= 50, {
      message: 'payload too large',
    })
    .refine((val) => JSON.stringify(val).length <= 1000, {
      message: 'payload too large',
    }),
  userId: z.string().optional(),
})

const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX_REQUESTS = 60

export async function POST(req: Request) {
  if (!redis) {
    return error('service unavailable', 503)
  }

  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const hashedIp = createHash('sha256').update(ip).digest('hex')
  const key = `telemetry:ip:${hashedIp}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS)
  }
  if (count > RATE_LIMIT_MAX_REQUESTS) {
    return error('rate limited', 429)
  }
  const json = await req.json()
  const parsed = telemetrySchema.safeParse(json)
  if (!parsed.success) {
    return error('invalid', 400)
  }
  try {
    await prisma.telemetry.create({ data: parsed.data })
  } catch (err) {
    console.warn('telemetry insert failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return error('server error', 500)
  }
  return ok({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventType = searchParams.get('eventType')
  const since = searchParams.get('since')

  const where: Record<string, unknown> = {}
  if (eventType) where.eventType = eventType
  if (since) {
    const date = new Date(since)
    if (isNaN(date.getTime())) {
      return error('invalid since', 400)
    }
    where.createdAt = { gte: date }
  }

  const data = await prisma.telemetry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return ok(data)
}
