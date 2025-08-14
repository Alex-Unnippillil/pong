import React from 'react'
import { redirect } from 'next/navigation'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HistoryPage() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const userId = session.user.id
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ p1Id: userId }, { p2Id: userId }],
    },
    orderBy: { startedAt: 'desc' },
    include: {
      p1: { select: { name: true } },
      p2: { select: { name: true } },
      winner: { select: { id: true, name: true } },
    },
  })

  return (
    <main className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Match History</h1>
      {matches.length === 0 ? (
        <p>No matches played yet.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">Opponent</th>
              <th className="px-4 py-2 text-left border-b">Score</th>
              <th className="px-4 py-2 text-left border-b">Date</th>
              <th className="px-4 py-2 text-left border-b">Winner</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const userIsP1 = match.p1Id === userId
              const opponentName = userIsP1
                ? (match.p2?.name ?? 'Unknown')
                : (match.p1.name ?? 'Unknown')
              const userScore = userIsP1 ? match.p1Score : match.p2Score
              const opponentScore = userIsP1 ? match.p2Score : match.p1Score
              const winner = match.winnerId
                ? match.winnerId === userId
                  ? 'You'
                  : (match.winner?.name ?? 'Unknown')
                : 'TBD'
              return (
                <tr key={match.id}>
                  <td className="px-4 py-2 border-b">{opponentName}</td>
                  <td className="px-4 py-2 border-b">
                    {userScore} - {opponentScore}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {match.startedAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border-b">{winner}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </main>
  )
}
