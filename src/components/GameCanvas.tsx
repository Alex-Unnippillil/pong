'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { GameScene } from '@/game/GameScene'

interface GameCanvasProps {
  width?: number
  height?: number
  onGameStart?: () => void
  onGameEnd?: (data: { winner: 'player' | 'ai' }) => void
}

export function GameCanvas({
  width,
  height,
  onGameStart,
  onGameEnd,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const w = width ?? containerRef.current.clientWidth
    const h = height ?? containerRef.current.clientHeight

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: w,
      height: h,
      scene: [GameScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
    })

    const scene = game.scene.getScene('GameScene') as GameScene
    if (onGameStart) scene.events.on('gameStart', onGameStart)
    if (onGameEnd) scene.events.on('gameEnd', onGameEnd)

    return () => {
      if (onGameStart) scene.events.off('gameStart', onGameStart)
      if (onGameEnd) scene.events.off('gameEnd', onGameEnd)
      game.destroy(true)
    }
  }, [width, height, onGameStart, onGameEnd])

  return <div ref={containerRef} />
}
