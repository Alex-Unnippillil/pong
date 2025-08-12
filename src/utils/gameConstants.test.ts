import { describe, expect, it } from 'vitest'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_SPEED,
  BALL_SPEED,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  PADDLE_OFFSET,
} from './gameConstants'

describe('game constants', () => {
  it('should be positive numbers', () => {
    const values = [
      GAME_WIDTH,
      GAME_HEIGHT,
      PADDLE_SPEED,
      BALL_SPEED,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      BALL_SIZE,
      PADDLE_OFFSET,
    ]
    values.forEach((v) => expect(v).toBeGreaterThan(0))
  })
})
