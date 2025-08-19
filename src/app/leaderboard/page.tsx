import React from 'react'
import { prisma } from '@/lib/prisma'
import { leaderboardQueryOptions } from '@/app/api/leaderboard/route'
import { useTranslations } from 'next-intl'

interface LeaderboardEntry {
  userId: string
  elo: number
  wins: number
  losses: number
  streak: number
  user: {
    name: string | null
  } | null
}

export default async function LeaderboardPage() {
  const t = useTranslations('leaderboard') // eslint-disable-line react-hooks/rules-of-hooks
  try {
    const data: LeaderboardEntry[] = await prisma.leaderboard.findMany(
      leaderboardQueryOptions,
    )

    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">{t('name')}</th>
              <th className="px-4 py-2 text-left border-b">{t('elo')}</th>
              <th className="px-4 py-2 text-left border-b">{t('wins')}</th>
              <th className="px-4 py-2 text-left border-b">{t('losses')}</th>
              <th className="px-4 py-2 text-left border-b">{t('streak')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.userId}>
                <td className="px-4 py-2 border-b">
                  {entry.user?.name ?? t('unknown')}
                </td>
                <td className="px-4 py-2 border-b">{entry.elo}</td>
                <td className="px-4 py-2 border-b">{entry.wins}</td>
                <td className="px-4 py-2 border-b">{entry.losses}</td>
                <td className="px-4 py-2 border-b">{entry.streak}</td>
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
        <h1 className="mb-4 text-3xl font-bold">{t('title')}</h1>
        <p>{t('unableToLoad')}</p>
      </main>
    )
  }
}
