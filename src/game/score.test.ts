import { describe, it, expect, vi } from 'vitest'
import { ScoreManager } from './score'

describe('ScoreManager', () => {
  it('updates scores and emits match result', () => {
    const score = new ScoreManager(2)
    const handler = vi.fn()
    score.onMatchEnd(handler)
    score.addPoint('player')
    expect(score.playerScore).toBe(1)
    expect(handler).not.toHaveBeenCalled()
    score.addPoint('player')
    expect(score.playerScore).toBe(2)
    expect(handler).toHaveBeenCalledWith({
      winner: 'player',
      playerScore: 2,
      opponentScore: 0,
    })
  })

  it('removes listeners when unsubscribe is called', () => {
    const score = new ScoreManager(1)
    const handler = vi.fn()
    const unsubscribe = score.onMatchEnd(handler)
    unsubscribe()
    score.addPoint('player')
    expect(handler).not.toHaveBeenCalled()
  })
})
