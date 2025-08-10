import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  eventType: z.string(),
  payload: z.any(),
  userId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    await prisma.telemetry.create({ data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to create telemetry', error)
    return NextResponse.json(
      { error: 'Failed to create telemetry' },
      { status: 500 },
    )
  }
}
