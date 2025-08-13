import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function ProfilePage() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/profile')
  }
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })
  return (
    <main className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Profile</h1>
      <form method="POST" action="/api/profile" className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block">
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={profile?.displayName ?? ''}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="avatarUrl" className="mb-1 block">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            defaultValue={profile?.avatarUrl ?? ''}
            className="w-full border px-2 py-1"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Save
        </button>
      </form>
    </main>
  )
}
