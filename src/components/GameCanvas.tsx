'use client'

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { MainScene } from '@/game/Scenes/MainScene'

interface GameCanvasProps {
  width?: number
  height?: number
}

export function GameCanvas({ width, height }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getSize = () => {
      if (width && height) return { width, height }
      const rect = container.getBoundingClientRect()
      return {
        width: rect.width || 800,
        height: rect.height || 600,
      }
    }

    const { width: w, height: h } = getSize()

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: w,
      height: h,
      scene: MainScene,
    })
    gameRef.current = game

    const handleResize = () => {
      if (!gameRef.current) return
      const { width: newWidth, height: newHeight } = getSize()
      gameRef.current.scale.resize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [width, height])

  return (
    <div
      ref={containerRef}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }}
    />
  )
}
