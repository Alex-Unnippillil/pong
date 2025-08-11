import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number(),
  p2Score: z.number(),
  winnerId: z.string(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
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
}
