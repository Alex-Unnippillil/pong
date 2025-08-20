import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    match: { findUnique: vi.fn() },
    matchChat: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    channel: () => ({
      send: vi.fn().mockResolvedValue({}),
    }),
  }),
}))

import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'
import { POST } from './route'

const user = { id: 'user1' }

describe('chat API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects non participants', async () => {
    ;(getServerAuthSession as unknown as vi.Mock).mockResolvedValue({ user })
    ;(prisma.match.findUnique as unknown as vi.Mock).mockResolvedValue({
      p1Id: 'other',
      p2Id: 'someone',
    })
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ message: 'hi' }),
    })
    const res = await POST(req, { params: { matchId: 'match1' } })
    expect(res.status).toBe(403)
  })

  it('allows participants', async () => {
    ;(getServerAuthSession as unknown as vi.Mock).mockResolvedValue({ user })
    ;(prisma.match.findUnique as unknown as vi.Mock).mockResolvedValue({
      p1Id: 'user1',
      p2Id: 'user2',
    })
    ;(prisma.matchChat.create as unknown as vi.Mock).mockResolvedValue({
      id: 'msg1',
      message: 'hi',
      createdAt: new Date(),
    })
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ message: 'hi' }),
    })
    const res = await POST(req, { params: { matchId: 'match1' } })
    expect(res.status).toBe(200)
    expect(prisma.matchChat.create).toHaveBeenCalled()
  })
})
