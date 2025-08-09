import { describe, it, expect } from 'vitest'
import { clamp } from './physics'

describe('clamp', () => {
  it('limits value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})
