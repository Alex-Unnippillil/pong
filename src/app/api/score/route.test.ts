/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { match: { update: vi.fn() } } }))

import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('POST /api/score', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const body = { matchId: '1', p1Score: 5, p2Score: 3, winnerId: '1' }

  it('updates match score', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.match.update).mockResolvedValue({} as any)
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true })
  })

  it('returns 401 when unauthorized', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(prisma.match.update).not.toHaveBeenCalled()
  })

  it('returns 500 on db error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.match.update).mockRejectedValue(new Error('db'))
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
