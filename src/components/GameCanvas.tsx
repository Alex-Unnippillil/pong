'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { PongScene } from '@/game/PongScene'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: container.clientWidth,
      height: container.clientHeight,
      scene: PongScene,
      physics: { default: 'arcade' },
    })

    const handleResize = () => {
      game.scale.resize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      game.destroy(true)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
