import dynamic from 'next/dynamic'

const GameCanvas = dynamic(
  () => import('../components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false },
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">PhotonPong</h1>
      <GameCanvas />
    </main>
  )
}
