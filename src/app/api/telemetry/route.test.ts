import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('../auth/[...nextauth]/route', () => ({ authOptions: {} }))
vi.mock('../../../lib/prisma', () => ({
  prisma: { telemetry: { create: vi.fn() } },
}))

import { POST } from './route'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'

const makeRequest = (body: unknown) =>
  new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('telemetry route', () => {
  beforeEach(() => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: '1' } })
  })

  it('returns 400 for invalid body', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 404 when database creation fails', async () => {
    ;(prisma.telemetry.create as any).mockRejectedValue(new Error('fail'))
    const res = await POST(
      makeRequest({ eventType: 'test', payload: {}, userId: '1' }),
    )
    expect(res.status).toBe(404)
    ;(prisma.telemetry.create as any).mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    ;(getServerSession as any).mockResolvedValueOnce(null)
    const res = await POST(
      makeRequest({ eventType: 'test', payload: {}, userId: '1' }),
    )
    expect(res.status).toBe(401)
  })
})
