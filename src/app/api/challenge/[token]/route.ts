import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { ok, error } from '@/lib/api-response'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  context: { params: { token: string } },
) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthenticated', 401)
  }
  const { token } = context.params
  try {
    const data = await redis.get<string>(`challenge:${token}`)
    if (!data) {
      return error('invalid token', 404)
    }
    const { matchId, p1Id } = JSON.parse(data) as {
      matchId: string
      p1Id: string
    }
    const p2Id = session.user.id
    await prisma.match.update({ where: { id: matchId }, data: { p2Id } })
    await redis.set(`match:${matchId}`, JSON.stringify({ p1: p1Id, p2: p2Id }))
    await redis.del(`challenge:${token}`)
    return ok({ matchId })
  } catch {
    return error('server error', 500)
  }
}
