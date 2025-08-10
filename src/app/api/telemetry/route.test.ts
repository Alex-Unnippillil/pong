import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    telemetry: {
      create: vi.fn(),
    },
  },
}))

import { POST } from './route'
import { prisma } from '@/lib/prisma'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/telemetry', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('telemetry POST handler', () => {
  it('accepts known event with valid payload', async () => {
    const req = makeRequest({
      eventType: 'match_start',
      payload: { matchId: '123' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(prisma.telemetry.create).toHaveBeenCalled()
  })

  it('rejects unknown events', async () => {
    const req = makeRequest({ eventType: 'unknown', payload: {} })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'unknown event' })
  })

  it('rejects invalid payload', async () => {
    const req = makeRequest({ eventType: 'match_start', payload: {} })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid payload' })
  })
})
