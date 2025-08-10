export interface LeaderboardStats {
  elo: number
  wins: number
  losses: number
  streak: number
}

function expectedScore(rating: number, opponentRating: number) {
  return 1 / (1 + Math.pow(10, (opponentRating - rating) / 400))
}

export function calculateElo(
  p1Elo: number,
  p2Elo: number,
  winner: 'p1' | 'p2',
  k = 32,
) {
  const exp1 = expectedScore(p1Elo, p2Elo)
  const exp2 = expectedScore(p2Elo, p1Elo)
  const score1 = winner === 'p1' ? 1 : 0
  const score2 = winner === 'p2' ? 1 : 0
  return {
    p1: Math.round(p1Elo + k * (score1 - exp1)),
    p2: Math.round(p2Elo + k * (score2 - exp2)),
  }
}

export function applyMatch(
  p1: LeaderboardStats,
  p2: LeaderboardStats,
  winner: 'p1' | 'p2',
) {
  const { p1: p1Elo, p2: p2Elo } = calculateElo(p1.elo, p2.elo, winner)
  const p1Win = winner === 'p1'
  const p2Win = winner === 'p2'
  const p1Streak = p1Win
    ? p1.streak >= 0
      ? p1.streak + 1
      : 1
    : p1.streak <= 0
      ? p1.streak - 1
      : -1
  const p2Streak = p2Win
    ? p2.streak >= 0
      ? p2.streak + 1
      : 1
    : p2.streak <= 0
      ? p2.streak - 1
      : -1
  return {
    p1: {
      elo: p1Elo,
      wins: p1Win ? p1.wins + 1 : p1.wins,
      losses: p1Win ? p1.losses : p1.losses + 1,
      streak: p1Streak,
    },
    p2: {
      elo: p2Elo,
      wins: p2Win ? p2.wins + 1 : p2.wins,
      losses: p2Win ? p2.losses : p2.losses + 1,
      streak: p2Streak,
    },
  }
}
