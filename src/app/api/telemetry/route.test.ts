import { describe, it, expect, vi } from 'vitest'
import { createHash } from 'node:crypto'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    telemetry: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../../../lib/redis', () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
  },
}))

import { POST, GET, telemetrySchema } from './route'
import { prisma } from '../../../lib/prisma'
import { redis } from '../../../lib/redis'

describe('telemetry API', () => {
  it('fails payload validation for oversized payload', () => {
    const payload = Object.fromEntries(
      Array.from({ length: 51 }, (_, i) => [`k${i}`, i]),
    )
    const result = telemetrySchema.safeParse({ eventType: 'start', payload })
    expect(result.success).toBe(false)
  })

  it('returns events filtered by eventType and since', async () => {
    const sinceDate = new Date('2023-01-01T00:00:00.000Z')
    const data = [
      { id: 1, eventType: 'start', payload: {}, createdAt: sinceDate },
    ]
    prisma.telemetry.findMany.mockResolvedValue(data)

    const url = `http://localhost/api/telemetry?eventType=start&since=${sinceDate.toISOString()}`
    const res = await GET(new Request(url))

    expect(prisma.telemetry.findMany).toHaveBeenCalledWith({
      where: { eventType: 'start', createdAt: { gte: sinceDate } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([
      {
        id: 1,
        eventType: 'start',
        payload: {},
        createdAt: sinceDate.toISOString(),
      },
    ])
  })

  it('returns 400 on invalid since', async () => {
    const res = await GET(
      new Request('http://localhost/api/telemetry?since=not-a-date'),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid since' })
    expect(prisma.telemetry.findMany).not.toHaveBeenCalled()
  })

  it('hashes ip before using rate limit key', async () => {
    const ip = '1.2.3.4'
    await POST(
      jsonRequest(
        { eventType: 'start', payload: {} },
        {
          headers: { 'x-forwarded-for': ip },
        },
      ),
    )

    const hashed = createHash('sha256').update(ip).digest('hex')
    expect(redis.incr).toHaveBeenCalledWith(`telemetry:ip:${hashed}`)
    expect(redis.expire).toHaveBeenCalledWith(`telemetry:ip:${hashed}`, 60)
  })

  it('rate limits when exceeding allowed requests', async () => {
    redis.incr.mockResolvedValueOnce(61)
    const res = await POST(jsonRequest({ eventType: 'start', payload: {} }))

    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'rate limited' })
    expect(prisma.telemetry.create).not.toHaveBeenCalled()
  })
})
