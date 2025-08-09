'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

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
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} />
}
