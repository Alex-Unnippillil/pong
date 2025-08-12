import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    telemetry: { create: vi.fn() },
  },
}))

vi.mock('../../../lib/redis', () => ({
  redis: {
    incr: vi.fn(async () => 1),
    expire: vi.fn(),
  },
}))

import { POST } from './route'
import { prisma } from '../../../lib/prisma'
import { redis } from '../../../lib/redis'

describe('telemetry API', () => {
  const body = { eventType: 'start', payload: { foo: 'bar' }, userId: 'u1' }

  it('stores telemetry events', async () => {
    const res = await POST(jsonRequest(body))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(prisma.telemetry.create).toHaveBeenCalledWith({ data: body })
  })

  it('rejects invalid payload', async () => {
    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'invalid' })
    expect(prisma.telemetry.create).not.toHaveBeenCalled()
  })

  it('rate limits excessive requests', async () => {
    ;(redis.incr as any).mockResolvedValueOnce(61)
    const res = await POST(jsonRequest(body))
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ ok: false, error: 'rate limited' })
  })
})
