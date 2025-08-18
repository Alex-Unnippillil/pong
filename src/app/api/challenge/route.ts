import crypto from 'crypto'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { ok, error } from '@/lib/api-response'

export const runtime = 'nodejs'

export async function POST() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthenticated', 401)
  }
  try {
    const match = await prisma.match.create({
      data: { p1Id: session.user.id, mode: 'classic', p1Score: 0, p2Score: 0 },
    })
    const token = crypto.randomUUID()
    await redis.set(
      `challenge:${token}`,
      JSON.stringify({ matchId: match.id, p1Id: session.user.id }),
    )
    return ok({ token })
  } catch {
    return error('server error', 500)
  }
}
