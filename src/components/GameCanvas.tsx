'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MainScene } from '../game/MainScene'

type GameCanvasProps = {
  width?: number
  height?: number
}

export function GameCanvas({ width = 800, height = 600 }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width,
      height,
      scene: MainScene,
      physics: {
        default: 'arcade',
      },
    })

    return () => {
      game.destroy(true)
    }
  }, [width, height])

  return <div ref={containerRef} />
}
