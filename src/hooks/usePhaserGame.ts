import { useEffect, useRef } from 'react'

import MainScene from '../game/MainScene'

// Lazy import type for Phaser to avoid loading on server
export type PhaserModule = typeof import('phaser')

export function usePhaserGame(
  containerRef: React.RefObject<HTMLDivElement>,
  muted: boolean,
  matchId?: string,
) {
  const gameRef = useRef<PhaserModule.Game | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const init = async () => {
      if (!gameRef.current) {
        const Phaser: PhaserModule = await import('phaser')
        const config: PhaserModule.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current!,
          width: containerRef.current!.clientWidth,
          height: containerRef.current!.clientHeight,
          scene: new MainScene(matchId),
        }
        gameRef.current = new Phaser.Game(config)
      }
      gameRef.current.sound.mute = muted
    }

    void init()
  }, [muted, containerRef, matchId])

  useEffect(() => {
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [containerRef])

  return gameRef
}
