'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import MainScene from '../game/mainScene'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new MainScene()

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      physics: { default: 'arcade', arcade: { debug: false } },
      scene,
    })

    return () => {
      scene.input.keyboard?.removeAllListeners()
      game.events.removeAllListeners()
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
