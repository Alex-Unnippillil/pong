import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

const GameCanvas = dynamic(
  () => import('../components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false },
)

export default async function Home() {
  const session = await getServerSession(authOptions)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">PhotonPong</h1>
      {session ? (
        <div className="mb-4 text-center">
          <p className="mb-2">Signed in as {session.user?.email}</p>
          <form action="/api/auth/signout" method="post">
            <button className="underline" type="submit">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <div className="mb-4 text-center">
          <p className="mb-2">You are not signed in</p>
          <Link className="underline" href="/api/auth/signin">
            Sign in
          </Link>
        </div>
      )}
      <GameCanvas />
    </main>
  )
}
