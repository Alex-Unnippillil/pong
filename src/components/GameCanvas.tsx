'use client'

import { useEffect, useRef } from 'react'

import MainScene from '../game/MainScene'
import { useSettings } from '../store/settings'

type Phaser = typeof import('phaser')

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const muted = useSettings((s) => s.muted)

  useEffect(() => {
    if (!containerRef.current) return

    let ignore = false

    const init = async () => {
      const Phaser: Phaser = await import('phaser')

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current!,
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
        scene: MainScene,
      }

      if (ignore) return

      const game = new Phaser.Game(config)
      game.sound.mute = muted
      gameRef.current = game
    }

    init()

    return () => {
      ignore = true
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.sound.mute = muted
    }
  }, [muted])

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
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
