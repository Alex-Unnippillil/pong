import { describe, it, expect } from 'vitest'
import { aiMove, movePaddle } from './paddle'

describe('paddle movement', () => {
  const screen = 200
  const paddle = 100
  const speed = 100
  const dt = 1

  it('moves up and down within bounds', () => {
    expect(movePaddle(100, -1, speed, dt, screen, paddle)).toBe(50)
    expect(movePaddle(50, -1, speed, dt, screen, paddle)).toBe(50)
    expect(movePaddle(100, 1, speed, dt, screen, paddle)).toBe(150)
    expect(movePaddle(150, 1, speed, dt, screen, paddle)).toBe(150)
  })

  it('AI moves toward the target', () => {
    expect(aiMove(150, 50, speed, dt, screen, paddle)).toBe(50)
    expect(aiMove(50, 150, speed, dt, screen, paddle)).toBe(150)
  })
})
