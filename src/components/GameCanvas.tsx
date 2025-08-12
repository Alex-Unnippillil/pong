'use client'

import Phaser from 'phaser'
import { useEffect, useRef } from 'react'

import MainScene from '../game/MainScene'
import { useSettings } from '../store/settings'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game>()
  const muted = useSettings((s) => s.muted)

  useEffect(() => {
    if (!containerRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      scene: MainScene,
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    return () => {
      game.destroy(true)
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
