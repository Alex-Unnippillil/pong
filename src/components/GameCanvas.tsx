'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { trackGameStart, trackGameEnd } from '../lib/events'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    trackGameStart('classic')
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

    return () => {
      trackGameEnd('classic', 'player')
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
