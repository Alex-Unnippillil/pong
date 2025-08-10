import request from 'supertest'
import { createServerFromHandler } from '../../../../test/test-utils'
import { POST } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: { telemetry: { create: vi.fn() } },
}))

describe('POST /api/telemetry', () => {
  const server = createServerFromHandler(POST)

  it('accepts valid telemetry', async () => {
    const body = { eventType: 'test', payload: { a: 1 }, userId: 'u1' }
    await request(server).post('/api/telemetry').send(body).expect(200)
    expect(prisma.telemetry.create).toHaveBeenCalledWith({ data: body })
  })

  it('rejects invalid payload', async () => {
    await request(server).post('/api/telemetry').send({}).expect(400)
  })
})
