'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const GameCanvas = dynamic(
  () => import('@/components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false },
)

export default function SpectatePage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'live' | 'ended' | 'disconnected'>(
    'live',
  )

  if (status === 'ended') {
    return (
      <div className="flex h-screen items-center justify-center">
        Match finished
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="flex h-screen items-center justify-center">
        Connection lost
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <GameCanvas
        matchId={params.id}
        spectate
        onMatchEnd={() => setStatus('ended')}
        onDisconnect={() => setStatus('disconnected')}
      />
    </main>
  )
}
