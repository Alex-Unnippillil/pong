/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/prisma', () => ({
  prisma: { leaderboard: { findMany: vi.fn() } },
}))
import { GET } from './route'
import { prisma } from '@/lib/prisma'

describe('Leaderboard API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 500 when Prisma throws', async () => {
    ;(prisma.leaderboard.findMany as unknown as vi.Mock).mockRejectedValue(
      new Error('db'),
    )
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await GET()
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to fetch leaderboard')
    expect(errorSpy).toHaveBeenCalled()
  })
})
