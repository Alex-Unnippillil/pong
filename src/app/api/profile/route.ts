import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { error } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  displayName: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const formData = await req.formData()
  const parsed = bodySchema.safeParse({
    displayName: formData.get('displayName')?.toString().trim() || null,
    avatarUrl: formData.get('avatarUrl')?.toString().trim() || null,
  })
  if (!parsed.success) {
    return error('invalid', 400)
  }
  const { displayName, avatarUrl } = parsed.data

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { displayName, avatarUrl },
    create: { userId: session.user.id, displayName, avatarUrl },
  })

  return NextResponse.redirect(new URL('/profile', req.url))
}
