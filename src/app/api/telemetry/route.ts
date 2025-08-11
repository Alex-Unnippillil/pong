import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

const schema = z.object({
  eventType: z.string(),
  payload: z
    .record(z.any())
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
