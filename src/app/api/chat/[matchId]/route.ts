import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env.server'
import { ok, error } from '@/lib/api-response'

const bodySchema = z.object({
  message: z.string().min(1).max(500),
})

export async function POST(
  req: Request,
  { params }: { params: { matchId: string } },
) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthorized', 401)
  }

  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    select: { p1Id: true, p2Id: true },
  })

  if (!match) {
    return error('not found', 404)
  }
  if (session.user.id !== match.p1Id && session.user.id !== match.p2Id) {
    return error('forbidden', 403)
  }

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return error('invalid', 400)
  }

  const db = prisma as unknown as {
    matchChat: {
      create: (args: {
        data: {
          matchId: string
          senderId: string
          message: string
        }
      }) => Promise<{
        id: string
        message: string
        createdAt: Date
      }>
    }
  }

  const created = await db.matchChat.create({
    data: {
      matchId: params.matchId,
      senderId: session.user.id,
      message: parsed.data.message,
    },
  })

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
    await supabase.channel(`chat:${params.matchId}`).send({
      type: 'broadcast',
      event: 'message',
      payload: {
        id: created.id,
        userId: session.user.id,
        message: created.message,
        createdAt: created.createdAt.toISOString(),
      },
    })
  }

  return ok({ ok: true })
}

export async function GET(
  _req: Request,
  { params }: { params: { matchId: string } },
) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthorized', 401)
  }
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    select: { p1Id: true, p2Id: true },
  })
  if (!match) {
    return error('not found', 404)
  }
  if (session.user.id !== match.p1Id && session.user.id !== match.p2Id) {
    return error('forbidden', 403)
  }

  const db = prisma as unknown as {
    matchChat: {
      findMany: (args: {
        where: { matchId: string }
        orderBy: { createdAt: 'asc' }
      }) => Promise<unknown[]>
    }
  }

  const messages = await db.matchChat.findMany({
    where: { matchId: params.matchId },
    orderBy: { createdAt: 'asc' },
  })

  return ok(messages)
}
