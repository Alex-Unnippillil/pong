import { redirect } from 'next/navigation'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HistoryPage() {
  const session = await getServerAuthSession()
  const user = session?.user
  if (!user) {
    redirect('/api/auth/signin')
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ p1Id: user!.id }, { p2Id: user!.id }] },
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
            const isP1 = match.p1Id === user!.id
            const opponent = isP1 ? match.p2?.name : match.p1.name
            const userScore = isP1 ? match.p1Score : match.p2Score
            const opponentScore = isP1 ? match.p2Score : match.p1Score
            const winner =
              match.winnerId === user!.id
                ? 'You'
                : (match.winner?.name ?? 'TBD')
            return (
              <tr key={match.id}>
                <td className="px-4 py-2 border-b">{opponent ?? 'Unknown'}</td>
                <td className="px-4 py-2 border-b">
                  {userScore} - {opponentScore}
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(match.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border-b">{winner}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
