import request from 'supertest'
import { createServerFromHandler } from '../../../../test/test-utils'
import { POST } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: { match: { update: vi.fn() } },
}))

describe('POST /api/score', () => {
  const server = createServerFromHandler(POST)

  it('records score when payload valid', async () => {
    const body = { matchId: 'm1', p1Score: 1, p2Score: 0, winnerId: 'p1' }
    await request(server).post('/api/score').send(body).expect(200)
    expect(prisma.match.update).toHaveBeenCalled()
  })

  it('rejects invalid payload', async () => {
    await request(server).post('/api/score').send({}).expect(400)
  })
})
