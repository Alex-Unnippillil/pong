'use client'

import { GameCanvas } from '@/components/GameCanvas'

export default function MatchPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mode?: 'classic' | 'ranked' }
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <GameCanvas matchId={params.id} mode={searchParams.mode} />
    </main>
  )
}
