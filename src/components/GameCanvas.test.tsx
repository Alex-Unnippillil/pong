import React from 'react'
;(globalThis as unknown as { React: typeof React }).React = React
import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('phaser', () => {
  class Game {
    canvas: HTMLCanvasElement
    scale = {
      resize: (width: number, height: number) => {
        this.canvas.width = width
        this.canvas.height = height
      },
    }
    sound = { mute: false }
    constructor(config: {
      parent?: HTMLElement
      width: number
      height: number
    }) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = config.width
      this.canvas.height = config.height
      if (config.parent) {
        config.parent.appendChild(this.canvas)
      }
    }
    destroy() {}
  }
  class Scene {}
  const PhaserMock = { AUTO: 0, Game, Scene }
  return { __esModule: true, default: PhaserMock, ...PhaserMock }
})

import { GameCanvas } from './GameCanvas'

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
})
