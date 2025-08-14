/* eslint-disable @typescript-eslint/no-explicit-any, no-var */
import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { act, render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

var Game: any

vi.mock('phaser', () => {
  Game = vi.fn(function (
    this: any,
    config: { parent?: HTMLElement; width: number; height: number },
  ) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = config.width
    this.canvas.height = config.height
    if (config.parent) {
      config.parent.appendChild(this.canvas)
    }
    this.scale = {
      resize: (width: number, height: number) => {
        this.canvas.width = width
        this.canvas.height = height
      },
    }
    this.sound = { mute: false }
    this.destroy = vi.fn()
  })
  class Scene {}
  class Vector2 {
    x: number
    y: number
    constructor(x: number, y: number) {
      this.x = x
      this.y = y
    }
    set(x: number, y: number) {
      this.x = x
      this.y = y
    }
  }
  const PhaserMock = {
    AUTO: 0,
    Game,
    Scene,
    Math: { Vector2 },
    Scenes: { Events: { DESTROY: 'destroy' } },
  }
  return { __esModule: true, default: PhaserMock, ...PhaserMock }
})

import { GameCanvas } from './GameCanvas'
import { useSettings } from '../store/settings'

beforeEach(() => {
  Game.mockClear()
})

describe('GameCanvas', () => {
  it('resizes canvas when window resizes', async () => {
    const { container } = render(<GameCanvas />)
    const div = container.firstChild as HTMLDivElement

    Object.defineProperty(div, 'clientWidth', {
      value: 100,
      configurable: true,
    })
    Object.defineProperty(div, 'clientHeight', {
      value: 100,
      configurable: true,
    })

    const canvas = await waitFor(() => {
      const c = div.querySelector('canvas') as HTMLCanvasElement | null
      if (!c) throw new Error('canvas not ready')
      return c
    })
    expect(canvas.width).toBe(100)
    expect(canvas.height).toBe(100)

    Object.defineProperty(div, 'clientWidth', {
      value: 200,
      configurable: true,
    })
    Object.defineProperty(div, 'clientHeight', {
      value: 150,
      configurable: true,
    })

    window.dispatchEvent(new Event('resize'))

    await waitFor(() => {
      expect(canvas.width).toBe(200)
      expect(canvas.height).toBe(150)
    })
  })

  it('initializes once and responds to muted changes', async () => {
    render(<GameCanvas />)

    await waitFor(() => {
      expect(Game).toHaveBeenCalledTimes(1)
    })

    act(() => {
      useSettings.getState().toggleMuted()
    })

    await waitFor(() => {
      expect(Game).toHaveBeenCalledTimes(1)
      expect((Game.mock.instances[0] as any).sound.mute).toBe(true)
    })

    act(() => {
      useSettings.getState().toggleMuted()
    })

    await waitFor(() => {
      expect((Game.mock.instances[0] as any).sound.mute).toBe(false)
    })
  })
})
