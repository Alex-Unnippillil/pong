'use client'

import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'

import { usePhaserGame } from '../hooks/usePhaserGame'
import { useSettings } from '../store/settings'

interface GameCanvasProps {
  matchId?: string
  spectator?: boolean
  onMatchEnd?: (result: unknown) => void
  onDisconnect?: () => void
}

export function GameCanvas({
  matchId,
  spectator = false,
  onMatchEnd,
  onDisconnect,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const muted = useSettings((s) => s.muted)
  const gameRef = usePhaserGame(containerRef, muted, matchId, spectator)

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

  useEffect(() => {
    if (!onMatchEnd && !onDisconnect) return
    const scene = gameRef.current?.scene.getScene('MainScene') as
      | Phaser.Scene
      | undefined
    if (!scene) return

    if (onMatchEnd) scene.events.once('matchEnd', onMatchEnd)
    if (onDisconnect) scene.events.once('channelDisconnect', onDisconnect)

    return () => {
      if (onMatchEnd) scene.events.off('matchEnd', onMatchEnd)
      if (onDisconnect) scene.events.off('channelDisconnect', onDisconnect)
    }
  }, [gameRef, onMatchEnd, onDisconnect])

  return <div ref={containerRef} className="w-full h-full" />
}
