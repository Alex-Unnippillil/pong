'use client'

import { useEffect, useRef } from 'react'
import { useSettings } from '@/store/settings'
import { usePhaserGame } from '@/hooks/usePhaserGame'

export default function MatchPage({ params }: { params: { id: string } }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const muted = useSettings((s) => s.muted)
  const gameRef = usePhaserGame(containerRef, muted, params.id)

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
  }, [gameRef])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div ref={containerRef} className="w-full h-full" />
    </main>
  )
}
