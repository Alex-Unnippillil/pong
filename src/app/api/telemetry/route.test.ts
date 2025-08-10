/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { telemetry: { create: vi.fn() } } }))

import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('POST /api/telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const body = { eventType: 'test', payload: { foo: 'bar' } }

  it('stores telemetry', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.telemetry.create).mockResolvedValue({} as any)
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
    expect(prisma.telemetry.create).not.toHaveBeenCalled()
  })

  it('returns 500 on db error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1' } } as any)
    vi.mocked(prisma.telemetry.create).mockRejectedValue(new Error('db'))
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
