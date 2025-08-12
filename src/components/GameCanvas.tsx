'use client'

import { useEffect, useRef } from 'react'
import type PhaserType from 'phaser'
import { useSettings } from '@/store/settings'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PhaserType.Game>()
  const muted = useSettings((s) => s.muted)

  useEffect(() => {
    if (!containerRef.current) return

    let resize: () => void

    const init = async () => {
      const Phaser = (await import('phaser')).default
      const { default: MainScene } = await import('@/game/MainScene')

      const { clientWidth: width, clientHeight: height } = containerRef.current!
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current!,
        width,
        height,
        scene: MainScene,
      })

      gameRef.current.sound.mute = muted

      resize = () => {
        if (!containerRef.current || !gameRef.current) return
        const { clientWidth: w, clientHeight: h } = containerRef.current
        gameRef.current.scale.resize(w, h)
      }

      window.addEventListener('resize', resize)
    }

    init()

    return () => {
      window.removeEventListener('resize', resize)
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
