import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    telemetry: { findMany: vi.fn() },
  },
}))

vi.mock('../../../lib/redis', () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
  },
}))

import { GET } from './route'
import { prisma } from '../../../lib/prisma'

describe('telemetry GET API', () => {
  it('filters by eventType and since', async () => {
    const mockData = [
      {
        id: 1,
        eventType: 'start',
        payload: { foo: 'bar' },
        userId: 'u1',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ]
    prisma.telemetry.findMany.mockResolvedValue(mockData)

    const res = await GET(
      new Request(
        'http://localhost/api/telemetry?eventType=start&since=2023-12-31',
      ),
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual(
      mockData.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() })),
    )
    expect(prisma.telemetry.findMany).toHaveBeenCalledWith({
      where: {
        eventType: 'start',
        createdAt: { gte: new Date('2023-12-31') },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  })

  it('returns 400 on invalid since', async () => {
    const res = await GET(
      new Request('http://localhost/api/telemetry?since=not-a-date'),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid since' })
    expect(prisma.telemetry.findMany).not.toHaveBeenCalled()
  })
})
