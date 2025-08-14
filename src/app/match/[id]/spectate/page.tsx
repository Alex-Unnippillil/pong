'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

const GameCanvas = dynamic(
  () => import('@/components/GameCanvas').then((m) => m.GameCanvas),
  { ssr: false },
)

interface MatchEndPayload {
  playerScore: number
  opponentScore: number
}

export default function SpectatePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [status, setStatus] = useState<'live' | 'ended' | 'disconnected'>(
    'live',
  )
  const [result, setResult] = useState<MatchEndPayload | null>(null)

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel(`match:${id}:spectate`)
      .on('broadcast', { event: 'matchEnd' }, ({ payload }) => {
        setResult(payload as MatchEndPayload)
        setStatus('ended')
      })

    channel.subscribe((s) => {
      if (s === 'CLOSED' || s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
        setStatus('disconnected')
      }
    })

    return () => {
      void channel.unsubscribe()
    }
  }, [id])

  if (status === 'ended' && result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div>Match ended</div>
        <div>
          {result.playerScore} - {result.opponentScore}
        </div>
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Disconnected
      </div>
    )
  }

  return (
    <main className="w-full h-screen">
      <GameCanvas matchId={id} spectate readOnly />
    </main>
  )
}
