import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

const schema = z.object({
  eventType: z.string(),
  payload: z
    .object({})
    .catchall(z.any())
    .refine((val) => Object.keys(val).length <= 50, {
      message: 'payload too large',
    })
    .refine((val) => JSON.stringify(val).length <= 1000, {
      message: 'payload too large',
    }),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ip =
    forwardedFor?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    // @ts-expect-error - ip is available on NextRequest
    (req as any).ip ||
    'unknown'
  const key = `telemetry:ip:${ip}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 60)
  }
  if (count > 60) {
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
    console.error('telemetry insert failed', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function GET(req: Request) {
  const apiKey = process.env.TELEMETRY_API_KEY
  if (apiKey && req.headers.get('x-api-key') !== apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventType = searchParams.get('eventType')
  const since = searchParams.get('since')

  const where: Record<string, unknown> = {}
  if (eventType) where.eventType = eventType
  if (since) {
    const date = new Date(since)
    if (!isNaN(date.getTime())) {
      where.createdAt = { gte: date }
    }
  }

  const data = await prisma.telemetry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(data)
}
