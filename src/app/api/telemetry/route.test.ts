import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

interface PrismaMock {
  telemetry: {
    create: (args: {
      data: {
        eventType: string
        payload: unknown
        userId?: string
      }
    }) => unknown
  }
}

vi.mock('../../../lib/prisma', () => {
  const prisma: PrismaMock = {
    telemetry: { create: vi.fn() },
  }
  return { prisma }
})

import { prisma } from '../../../lib/prisma'

describe('telemetry API', () => {
  it('stores telemetry events', async () => {
    const body = { eventType: 'start', payload: { foo: 'bar' }, userId: 'u1' }

    const res = await POST(jsonRequest(body))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(prisma.telemetry.create).toHaveBeenCalledWith({ data: body })
  })

  it('rejects invalid payload', async () => {
    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'invalid' })
    expect(prisma.telemetry.create).not.toHaveBeenCalled()
  })
})
