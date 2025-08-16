import { describe, it, expect, vi } from 'vitest'
import MainScene from './MainScene'
import { ScoreManager } from './score'

vi.mock('phaser', () => {
  class Scene {
    add = {
      circle: vi.fn(() => ({})),
      rectangle: vi.fn(() => ({})),
      text: vi.fn(() => ({ setOrigin: vi.fn().mockReturnThis() })),
    }
    input = { keyboard: { createCursorKeys: vi.fn(() => ({})) } }
    events = { emit: vi.fn(), once: vi.fn() }
    scale = { width: 800, height: 600 }
  }
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
  return {
    default: {
      Scene,
      Math: { Vector2 },
      Geom: { Intersects: { RectangleToRectangle: vi.fn() } },
      Scenes: { Events: { DESTROY: 'destroy' } },
    },
  }
})

describe('MainScene', () => {
  it('logs an error when score submission fails', async () => {
    const scene = new MainScene('match')
    Object.assign(scene as object, { score: new ScoreManager(1) })
    scene.create()

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    ;(globalThis as { fetch: typeof fetch }).fetch = fetchMock
    ;(scene as unknown as { score: ScoreManager }).score.addPoint('player')
    await Promise.resolve()

    expect(errorSpy).toHaveBeenCalled()
  })
})
