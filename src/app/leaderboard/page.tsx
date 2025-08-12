import React from 'react'

interface LeaderboardEntry {
  userId: string
  elo: number
  wins: number
  losses: number
  user: {
    name: string | null
  } | null
}

export default async function LeaderboardPage() {
  try {
    const res = await fetch('/api/leaderboard', {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error('Failed to fetch leaderboard')
    }

    const data: LeaderboardEntry[] = await res.json()

    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Leaderboard</h1>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">Name</th>
              <th className="px-4 py-2 text-left border-b">ELO</th>
              <th className="px-4 py-2 text-left border-b">Wins</th>
              <th className="px-4 py-2 text-left border-b">Losses</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.userId}>
                <td className="px-4 py-2 border-b">
                  {entry.user?.name ?? 'Unknown'}
                </td>
                <td className="px-4 py-2 border-b">{entry.elo}</td>
                <td className="px-4 py-2 border-b">{entry.wins}</td>
                <td className="px-4 py-2 border-b">{entry.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    )
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Leaderboard</h1>
        <p>Unable to load leaderboard data.</p>
      </main>
    )
  }
}
