import { z } from 'zod'
import { NextResponse } from 'next/server'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { error } from '@/lib/api-response'

const bodySchema = z.object({
  displayName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const formData = await req.formData()
  const data = {
    displayName: formData.get('displayName')?.toString().trim() || undefined,
    avatarUrl: formData.get('avatarUrl')?.toString().trim() || undefined,
  }
  const parsed = bodySchema.safeParse(data)
  if (!parsed.success) {
    return error('invalid', 400)
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.redirect(new URL('/profile', req.url))
}
