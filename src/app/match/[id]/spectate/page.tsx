'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

import { GameCanvas } from '@/components/GameCanvas'

export default function SpectatePage() {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<'live' | 'ended' | 'disconnected'>(
    'live',
  )

  if (status === 'ended') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Match ended</p>
      </main>
    )
  }

  if (status === 'disconnected') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Disconnected from match</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <GameCanvas
        matchId={id}
        spectator
        onMatchEnd={() => setStatus('ended')}
        onDisconnect={() => setStatus('disconnected')}
      />
    </main>
  )
}
