'use client'

import { useEffect, useState } from 'react'

interface SpectateState {
  paddleY: number
  opponentY: number
  ballX: number
  ballY: number
  playerScore: number
  opponentScore: number
}

export default function SpectatorView({ params }: { params: { id: string } }) {
  const [state, setState] = useState<SpectateState>({
    paddleY: 0,
    opponentY: 0,
    ballX: 0,
    ballY: 0,
    playerScore: 0,
    opponentScore: 0,
  })

  useEffect(() => {
    const es = new EventSource(`/api/match/${params.id}/spectate`)
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        setState((s) => ({ ...s, ...data }))
      } catch {
        // ignore malformed data
      }
    }
    return () => {
      es.close()
    }
  }, [params.id])

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-2 left-1/4 text-white text-2xl">
        {state.playerScore}
      </div>
      <div className="absolute top-2 right-1/4 text-white text-2xl">
        {state.opponentScore}
      </div>
      <div
        className="absolute bg-white w-2 h-24"
        style={{ left: '20px', top: state.paddleY - 50 }}
      />
      <div
        className="absolute bg-white w-2 h-24"
        style={{ right: '20px', top: state.opponentY - 50 }}
      />
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: '10px',
          height: '10px',
          left: state.ballX,
          top: state.ballY,
        }}
      />
    </div>
  )
}
