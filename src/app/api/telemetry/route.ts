import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { error, parseBody } from '@/utils/api'

const schema = z.object({
  eventType: z.string(),
  payload: z
    .record(z.string(), z.any())
    .refine((val) => Object.keys(val).length <= 50, {
      message: 'payload too large',
    })
    .refine((val) => JSON.stringify(val).length <= 1000, {
      message: 'payload too large',
    }),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const key = `telemetry:ip:${ip}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 60)
  }
  if (count > 60) {
    return error(429, 'rate limited')
  }
  const [body, bodyErr] = await parseBody(schema, req)
  if (bodyErr) return bodyErr
  try {
    await prisma.telemetry.create({ data: body! })
  } catch (err) {
    console.error('telemetry insert failed', err)
    return error(500, 'server error')
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
    if (!isNaN(date.getTime())) {
      where.createdAt = { gte: date }
    }
  }

  try {
    const data = await prisma.telemetry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(data)
  } catch {
    return error(500, 'server error')
  }
}
