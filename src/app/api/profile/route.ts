import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { error } from '@/lib/api-response'

const profileSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return error('unauthorized', 401)
  }
  const formData = await req.formData()
  const body = {
    displayName: formData.get('displayName')?.toString(),
    avatarUrl: formData.get('avatarUrl')?.toString(),
  }
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return error('invalid', 400)
  }
  const { displayName, avatarUrl } = parsed.data
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName,
      avatarUrl: avatarUrl || undefined,
    },
    update: { displayName, avatarUrl: avatarUrl || undefined },
  })
  return NextResponse.redirect(new URL('/profile', req.url))
}
