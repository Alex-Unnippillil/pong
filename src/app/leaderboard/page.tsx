import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface LeaderboardEntry {
  userId: string
  elo: number
  user: {
    name: string | null
  }
}

export default async function LeaderboardPage() {
  const res = await fetch('http://localhost:3000/api/leaderboard', {
    cache: 'no-store',
  })
  const data: LeaderboardEntry[] = await res.json()

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Leaderboard</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">ELO</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={entry.userId}>
              <td className="border-t px-4 py-2">{index + 1}</td>
              <td className="border-t px-4 py-2">
                {entry.user.name || 'Unknown'}
              </td>
              <td className="border-t px-4 py-2">{entry.elo}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Link href="/">Back to game</Link>
      </div>
    </main>
  )
}
