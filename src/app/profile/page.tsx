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
      <form action="/api/profile" method="POST" className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="mb-1">Display Name</span>
          <input
            type="text"
            name="displayName"
            defaultValue={profile?.displayName ?? ''}
            className="border p-2"
          />
        </label>
        <label className="flex flex-col">
          <span className="mb-1">Avatar URL</span>
          <input
            type="text"
            name="avatarUrl"
            defaultValue={profile?.avatarUrl ?? ''}
            className="border p-2"
          />
        </label>
        <button type="submit" className="rounded bg-blue-500 p-2 text-white">
          Save
        </button>
      </form>
    </main>
  )
}
