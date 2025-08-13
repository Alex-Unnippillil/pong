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
      <form method="post" action="/api/profile" className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="displayName" className="mb-1 font-medium">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile?.displayName ?? ''}
            className="border px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="avatarUrl" className="mb-1 font-medium">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            defaultValue={profile?.avatarUrl ?? ''}
            className="border px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-medium text-white"
        >
          Save
        </button>
      </form>
    </main>
  )
}
