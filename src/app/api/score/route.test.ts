/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/prisma', () => ({
  prisma: { match: { update: vi.fn() } },
}))
import { POST } from './route'
import { prisma } from '@/lib/prisma'

describe('Score API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 500 when Prisma throws', async () => {
    const body = { matchId: 'm1', p1Score: 1, p2Score: 2, winnerId: 'p2' }
    const req = new Request('http://localhost/api/score', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    ;(prisma.match.update as unknown as vi.Mock).mockRejectedValue(
      new Error('db'),
    )
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to update match score')
    expect(errorSpy).toHaveBeenCalled()
  })
})
