'use client'

import { useEffect, useRef } from 'react'

import { usePhaserGame } from '../hooks/usePhaserGame'
import { useSettings } from '../store/settings'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const muted = useSettings((s) => s.muted)
  const gameRef = usePhaserGame(containerRef, muted)

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
