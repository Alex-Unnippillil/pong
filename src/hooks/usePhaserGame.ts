import { useEffect, useRef } from 'react'

import MainScene from '../game/MainScene'

// Lazy import type for Phaser to avoid loading on server
export type PhaserModule = typeof import('phaser')

export interface UsePhaserGameOptions {
  matchId?: string
  spectate?: boolean
  readOnly?: boolean
}

export function usePhaserGame(
  containerRef: React.RefObject<HTMLDivElement>,
  muted: boolean,
  options: UsePhaserGameOptions = {},
) {
  const gameRef = useRef<PhaserModule.Game | null>(null)

  const { matchId, spectate, readOnly } = options

  useEffect(() => {
    if (!containerRef.current) return

    const init = async () => {
      if (!gameRef.current) {
        const Phaser: PhaserModule = await import('phaser')
        const scene = new MainScene(matchId, { spectate, readOnly })
        const config: PhaserModule.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current!,
          width: containerRef.current!.clientWidth,
          height: containerRef.current!.clientHeight,
          scene,
        }
        gameRef.current = new Phaser.Game(config)
      }
      if (gameRef.current) {
        gameRef.current.sound.mute = muted
      }
    }

    void init()
  }, [muted, containerRef, matchId, spectate, readOnly])

  useEffect(() => {
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [containerRef, matchId, spectate, readOnly])

  return gameRef
}
