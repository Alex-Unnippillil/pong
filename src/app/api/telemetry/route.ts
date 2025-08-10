import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  eventType: z.string(),
  payload: z.any(),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  let json
  try {
    json = await req.json()
  } catch (err) {
    console.error('Invalid JSON in telemetry request', err)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    console.error('Invalid telemetry payload', parsed.error)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  try {
    const allowed = await rateLimit(`telemetry:${ip}`, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
  } catch (err) {
    console.error('Rate limit failed for telemetry', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }

  try {
    await prisma.telemetry.create({ data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to record telemetry', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
