import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  eventType: z.string(),
  payload: z.any(),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  const json = await req.json()
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  await prisma.telemetry.create({ data: parsed.data })
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

  const data = await prisma.telemetry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(data)
}
