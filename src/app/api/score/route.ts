import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number(),
  p2Score: z.number(),
  winnerId: z.string(),
})

export async function POST(req: Request) {
  let json
  try {
    json = await req.json()
  } catch (err) {
    console.error('Invalid JSON in score request', err)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    console.error('Invalid score payload', parsed.error)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  try {
    const allowed = await rateLimit(`score:${ip}`, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
  } catch (err) {
    console.error('Rate limit failed for score', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }

  const { matchId, p1Score, p2Score, winnerId } = parsed.data
  try {
    await prisma.match.update({
      where: { id: matchId },
      data: { p1Score, p2Score, winnerId, endedAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to update match score', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
