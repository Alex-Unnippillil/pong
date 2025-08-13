import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { error } from '@/lib/api-response'

const bodySchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const formData = await req.formData()
  const parsed = bodySchema.safeParse({
    displayName: formData.get('displayName')?.toString() || undefined,
    avatarUrl: formData.get('avatarUrl')?.toString() || undefined,
  })
  if (!parsed.success) {
    return error('invalid', 400)
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  })

  return NextResponse.redirect(new URL('/profile', req.url))
}
