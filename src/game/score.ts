export type Side = 'player' | 'opponent'

export interface MatchResult {
  winner: Side
  playerScore: number
  opponentScore: number
}

export class ScoreManager {
  playerScore = 0
  opponentScore = 0
  private listeners: ((result: MatchResult) => void)[] = []

  constructor(private winScore = 10) {}

  addPoint(side: Side) {
    if (side === 'player') {
      this.playerScore++
    } else {
      this.opponentScore++
    }

    if (
      this.playerScore >= this.winScore ||
      this.opponentScore >= this.winScore
    ) {
      const result: MatchResult = {
        winner: this.playerScore > this.opponentScore ? 'player' : 'opponent',
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
      }
      this.listeners.forEach((cb) => cb(result))
    }
  }

  onMatchEnd(cb: (result: MatchResult) => void) {
    this.listeners.push(cb)
  }
}
