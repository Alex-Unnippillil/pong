'use client'

import { useEffect, useRef } from 'react'

import { usePhaserGame } from '../hooks/usePhaserGame'
import { useSettings } from '../store/settings'
import type MainScene from '../game/MainScene'

interface GameCanvasProps {
  matchId?: string
  spectate?: boolean
  onMatchEnd?: () => void
  onDisconnect?: () => void
}

export function GameCanvas({
  matchId,
  spectate,
  onMatchEnd,
  onDisconnect,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const muted = useSettings((s) => s.muted)
  const gameRef = usePhaserGame(containerRef, muted, matchId, spectate)

  useEffect(() => {
    if (!gameRef.current) return
    const scene = gameRef.current.scene.keys.MainScene as unknown as MainScene
    if (!scene) return
    if (onMatchEnd) scene.events.on('matchEnd', onMatchEnd)
    if (onDisconnect) scene.events.on('channelClose', onDisconnect)
    return () => {
      if (onMatchEnd) scene.events.off('matchEnd', onMatchEnd)
      if (onDisconnect) scene.events.off('channelClose', onDisconnect)
    }
  }, [gameRef, onMatchEnd, onDisconnect])

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
  }, [containerRef, gameRef])

  return <div ref={containerRef} className="w-full h-full" />
}
