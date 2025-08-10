'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { track } from '../lib/analytics'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const mode = 'local'
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      scene: {
        preload() {},
        create() {},
        update() {},
      },
    })

    track('game_start', { mode })

    return () => {
      track('game_end', { mode, winner: 'none' })
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
