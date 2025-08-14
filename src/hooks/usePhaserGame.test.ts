/* eslint-disable @typescript-eslint/no-explicit-any, no-var */
import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

var Game: any

vi.mock('phaser', () => {
  Game = vi.fn(function (this: any) {
    this.sound = { mute: false }
    this.destroy = vi.fn()
  })
  class Scene {}
  const PhaserMock = { AUTO: 0, Game, Scene }
  return { __esModule: true, default: PhaserMock, ...PhaserMock }
})

import { usePhaserGame } from './usePhaserGame'

describe('usePhaserGame', () => {
  beforeEach(() => {
    Game.mockClear()
  })

  it('creates a game instance and syncs mute state', async () => {
    const container = document.createElement('div')
    const ref = { current: container } as React.RefObject<HTMLDivElement>

    const { rerender } = renderHook(({ muted }) => usePhaserGame(ref, muted), {
      initialProps: { muted: false },
    })

    await waitFor(() => {
      expect(Game).toHaveBeenCalledTimes(1)
    })

    expect((Game.mock.instances[0] as any).sound.mute).toBe(false)

    rerender({ muted: true })

    await waitFor(() => {
      expect((Game.mock.instances[0] as any).sound.mute).toBe(true)
    })
  })

  it('destroys the game on unmount', async () => {
    const container = document.createElement('div')
    const ref = { current: container } as React.RefObject<HTMLDivElement>

    const { unmount } = renderHook(() => usePhaserGame(ref, false))

    await waitFor(() => {
      expect(Game).toHaveBeenCalledTimes(1)
    })

    const instance = Game.mock.instances[0]

    unmount()

    expect(instance.destroy).toHaveBeenCalledWith(true)
  })
})
