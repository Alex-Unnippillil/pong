import React from 'react'
import { redirect } from 'next/navigation'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function ProfilePage() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <main className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Profile</h1>
      <form
        action="/api/profile"
        method="post"
        className="flex flex-col gap-4 max-w-md"
      >
        <label className="flex flex-col">
          <span className="mb-1">Display Name</span>
          <input
            type="text"
            name="displayName"
            defaultValue={profile?.displayName ?? ''}
            className="border px-2 py-1"
          />
        </label>
        <label className="flex flex-col">
          <span className="mb-1">Avatar URL</span>
          <input
            type="url"
            name="avatarUrl"
            defaultValue={profile?.avatarUrl ?? ''}
            className="border px-2 py-1"
          />
        </label>
        <button type="submit" className="px-4 py-2 text-white bg-blue-600">
          Save
        </button>
      </form>
    </main>
  )
}
