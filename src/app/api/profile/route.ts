import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { error } from '@/lib/api-response'

const bodySchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
})

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const formData = await req.formData()
  const data = Object.fromEntries(formData.entries())
  const parsed = bodySchema.safeParse(data)
  if (!parsed.success) {
    return error('invalid', 400)
  }

  const displayName = parsed.data.displayName?.trim() || null
  const avatarUrl = parsed.data.avatarUrl?.trim() || null

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { displayName, avatarUrl },
    create: { userId: session.user.id, displayName, avatarUrl },
  })

  return NextResponse.redirect(new URL('/profile', req.url))
}
