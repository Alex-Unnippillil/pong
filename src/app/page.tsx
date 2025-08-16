import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const GameCanvas = dynamic(
  () => import('../components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false },
)

export default function Home() {
  const t = useTranslations()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>
      <GameCanvas />
    </main>
  )
}
