import { redirect } from 'next/navigation'

import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HistoryPage() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ p1Id: session.user.id }, { p2Id: session.user.id }],
    },
    include: {
      p1: { select: { name: true } },
      p2: { select: { name: true } },
    },
    orderBy: { startedAt: 'desc' },
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
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            const isP1 = match.p1Id === session.user.id
            const opponent = isP1 ? match.p2 : match.p1
            const yourScore = isP1 ? match.p1Score : match.p2Score
            const opponentScore = isP1 ? match.p2Score : match.p1Score
            return (
              <tr key={match.id}>
                <td className="px-4 py-2 border-b">
                  {opponent?.name ?? 'Unknown'}
                </td>
                <td className="px-4 py-2 border-b">
                  {yourScore} - {opponentScore}
                </td>
                <td className="px-4 py-2 border-b">
                  {match.startedAt.toLocaleDateString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}
