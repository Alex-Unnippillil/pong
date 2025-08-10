import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number(),
  p2Score: z.number(),
  winnerId: z.string(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const { matchId, p1Score, p2Score, winnerId } = parsed.data
    await prisma.match.update({
      where: { id: matchId },
      data: { p1Score, p2Score, winnerId, endedAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to update match score', error)
    return NextResponse.json(
      { error: 'Failed to update match score' },
      { status: 500 },
    )
  }
}
