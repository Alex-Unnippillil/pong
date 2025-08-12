'use client'

import { useEffect, useRef } from 'react'


export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PhaserType.Game>()
  const muted = useSettings((s) => s.muted)

  useEffect(() => {
    if (!containerRef.current) return
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
