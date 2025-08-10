/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/prisma', () => ({
  prisma: { telemetry: { create: vi.fn() } },
}))
import { POST } from './route'
import { prisma } from '@/lib/prisma'

describe('Telemetry API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 500 when Prisma throws', async () => {
    const body = { eventType: 'test', payload: {}, userId: 'u1' }
    const req = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    ;(prisma.telemetry.create as unknown as vi.Mock).mockRejectedValue(
      new Error('db'),
    )
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to create telemetry')
    expect(errorSpy).toHaveBeenCalled()
  })
})
