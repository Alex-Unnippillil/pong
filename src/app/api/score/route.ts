import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { error, parseBody } from '@/utils/api'

const bodySchema = z.object({
  matchId: z.string(),
  p1Score: z.number(),
  p2Score: z.number(),
  winnerId: z.string(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error(401, 'unauthorized')
  }
  const [body, bodyErr] = await parseBody(bodySchema, req)
  if (bodyErr) return bodyErr
  const { matchId, p1Score, p2Score, winnerId } = body!
  try {
    await prisma.match.update({
      where: { id: matchId },
      data: { p1Score, p2Score, winnerId, endedAt: new Date() },
    })
  } catch {
    return error(500, 'server error')
  }
  return NextResponse.json({ ok: true })
}
