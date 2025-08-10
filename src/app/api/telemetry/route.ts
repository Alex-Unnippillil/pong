import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  telemetryEventSchemas,
  TelemetryEventType,
} from '@/lib/telemetrySchema'

const schema = z.object({
  eventType: z.string(),
  payload: z.unknown(),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const { eventType, payload, userId } = parsed.data
  const eventSchema = telemetryEventSchemas[eventType as TelemetryEventType]

  if (!eventSchema) {
    return NextResponse.json({ error: 'unknown event' }, { status: 400 })
  }

  const payloadParsed = eventSchema.safeParse(payload)
  if (!payloadParsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  await prisma.telemetry.create({
    data: {
      eventType,
      payload: payloadParsed.data,
      userId,
    },
  })
  return NextResponse.json({ ok: true })
}
