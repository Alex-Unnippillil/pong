import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { z } = require('zod')

const schema = z.object({
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
  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const key = `telemetry:ip:${ip}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS)
  }
  if (count > RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 })
  }
  const json = await req.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  try {
    await prisma.telemetry.create({ data: parsed.data })
  } catch (err) {
    console.warn('telemetry insert failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
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
      return NextResponse.json({ error: 'invalid since' }, { status: 400 })
    }
    where.createdAt = { gte: date }
  }

  const data = await prisma.telemetry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(data)
}
