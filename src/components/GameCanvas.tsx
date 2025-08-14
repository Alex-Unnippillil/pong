'use client'

import { useEffect, useRef } from 'react'

import { usePhaserGame, UsePhaserGameOptions } from '../hooks/usePhaserGame'
import { useSettings } from '../store/settings'

type GameCanvasProps = UsePhaserGameOptions

export function GameCanvas({
  matchId,
  spectate,
  readOnly,
}: GameCanvasProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const muted = useSettings((s) => s.muted)
  const gameRef = usePhaserGame(containerRef, muted, {
    matchId,
    spectate,
    readOnly,
  })

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !gameRef.current) return
      gameRef.current.scale.resize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      )
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [gameRef])

  return <div ref={containerRef} className="w-full h-full" />
}
