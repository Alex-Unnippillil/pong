'use client'

import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'

import MainScene from '@/game/MainScene'
import { useSettings } from '@/store/settings'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game>()
  const muted = useSettings((s) => s.muted)

  useEffect(() => {
    if (!containerRef.current) return

    let destroyed = false

    import('phaser').then(({ default: Phaser }) => {
      if (destroyed || !containerRef.current) return

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        scene: MainScene,
      })

      game.sound.mute = muted
      gameRef.current = game
    })

    return () => {
      destroyed = true
      gameRef.current?.destroy(true)
      gameRef.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.sound.mute = muted
    }
  }, [muted])

  return <div ref={containerRef} className="w-full h-full" />
}
