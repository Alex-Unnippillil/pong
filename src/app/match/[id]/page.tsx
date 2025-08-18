'use client'

import { GameCanvas } from '@/components/GameCanvas'

export default function MatchPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <GameCanvas matchId={params.id} />
    </main>
  )
}
