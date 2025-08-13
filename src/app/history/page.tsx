import React from 'react'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
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
    },
  })

  return (
    <main className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Match History</h1>
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">Opponent</th>
              <th className="px-4 py-2 text-left border-b">Score</th>
              <th className="px-4 py-2 text-left border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const opponentName =
                match.p1Id === userId
                  ? (match.p2?.name ?? 'Unknown')
                  : (match.p1.name ?? 'Unknown')
              const userScore =
                match.p1Id === userId ? match.p1Score : match.p2Score
              const opponentScore =
                match.p1Id === userId ? match.p2Score : match.p1Score
              return (
                <tr key={match.id}>
                  <td className="px-4 py-2 border-b">{opponentName}</td>
                  <td className="px-4 py-2 border-b">{`${userScore} - ${opponentScore}`}</td>
                  <td className="px-4 py-2 border-b">
                    {match.startedAt.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </main>
  )
}
