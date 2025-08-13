import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const formData = await req.formData()
  const data = {
    displayName: (formData.get('displayName') as string) || undefined,
    avatarUrl: (formData.get('avatarUrl') as string) || undefined,
  }
  const parsed = bodySchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }
  const { displayName, avatarUrl } = parsed.data
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { displayName: displayName ?? null, avatarUrl: avatarUrl ?? null },
    create: {
      userId: session.user.id,
      displayName: displayName ?? null,
      avatarUrl: avatarUrl ?? null,
    },
  })
  return NextResponse.redirect(new URL('/profile', req.url), 303)
}
