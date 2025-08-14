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
      <form action="/api/profile" method="POST" className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={profile?.displayName ?? ''}
            className="w-full border p-2"
          />
        </div>
        <div>
          <label htmlFor="avatarUrl" className="mb-1 block">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            type="text"
            defaultValue={profile?.avatarUrl ?? ''}
            className="w-full border p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 px-4 py-2 text-white">
          Save
        </button>
      </form>
    </main>
  )
}
