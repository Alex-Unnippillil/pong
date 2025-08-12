import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    telemetry: { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
  },
}))

vi.mock('../../../lib/redis', () => ({
  redis: { incr: vi.fn().mockResolvedValue(1), expire: vi.fn() },
}))

import { prisma } from '../../../lib/prisma'
import { redis } from '../../../lib/redis'
import { POST, GET } from './route'

describe('telemetry POST', () => {
  const body = { eventType: 'start', payload: { foo: 'bar' }, userId: 'u1' }

  it('uses first ip from x-forwarded-for', async () => {
    const res = await POST(
      jsonRequest(body, {
        headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' },
      }),
    )
    expect(res.status).toBe(200)
    expect(redis.incr).toHaveBeenCalledWith('telemetry:ip:1.1.1.1')
    expect(prisma.telemetry.create).toHaveBeenCalledWith({ data: body })
  })

  it('falls back to x-real-ip', async () => {
    await POST(
      jsonRequest(body, {
        headers: { 'x-real-ip': '3.3.3.3' },
      }),
    )
    expect(redis.incr).toHaveBeenCalledWith('telemetry:ip:3.3.3.3')
  })

  it('falls back to req.ip', async () => {
    const req = jsonRequest(body)
    ;(req as any).ip = '4.4.4.4'
    await POST(req)
    expect(redis.incr).toHaveBeenCalledWith('telemetry:ip:4.4.4.4')
  })

  it('rejects invalid payload', async () => {
    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid' })
    expect(prisma.telemetry.create).not.toHaveBeenCalled()
  })
})

describe('telemetry GET', () => {
  it('rejects unauthorized access', async () => {
    process.env.TELEMETRY_API_KEY = 'secret'
    const res = await GET(new Request('http://localhost/api'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })
    delete process.env.TELEMETRY_API_KEY
  })

  it('allows access with valid key', async () => {
    process.env.TELEMETRY_API_KEY = 'secret'
    const res = await GET(
      new Request('http://localhost/api', {
        headers: { 'x-api-key': 'secret' },
      }),
    )
    expect(res.status).toBe(200)
    expect(prisma.telemetry.findMany).toHaveBeenCalled()
    delete process.env.TELEMETRY_API_KEY
  })
})
