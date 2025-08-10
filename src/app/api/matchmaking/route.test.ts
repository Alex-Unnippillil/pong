/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/redis', () => ({ redis: { lpush: vi.fn() } }))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import { POST } from './route'
import { redis } from '@/lib/redis'
import { getServerSession } from 'next-auth'

describe('POST /api/matchmaking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queues matchmaking request', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(redis.lpush).mockResolvedValue(1 as any)
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const res = await POST()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.roomId).toBe('3lllllll') // Math.random=0.1
  })

  it('returns 401 when unauthorized', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const res = await POST()
    expect(res.status).toBe(401)
    expect(redis.lpush).not.toHaveBeenCalled()
  })

  it('returns 500 on redis error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(redis.lpush).mockRejectedValue(new Error('redis'))
    const res = await POST()
    expect(res.status).toBe(500)
  })
})
