'use client'

import { useEffect } from 'react'
import { trackLeaderboardView } from '../../lib/events'

export default function LeaderboardPage() {
  useEffect(() => {
    trackLeaderboardView()
  }, [])
  return <div>Leaderboard</div>
}
