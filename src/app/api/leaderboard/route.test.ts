import request from 'supertest'
import { createServerFromHandler } from '../../../../test/test-utils'
import { GET } from './route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaderboard: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          { id: '1', elo: 100, user: { id: 'u', name: 'User' } },
        ]),
    },
  },
}))

describe('GET /api/leaderboard', () => {
  it('returns leaderboard data', async () => {
    const server = createServerFromHandler(GET)
    const res = await request(server).get('/api/leaderboard').expect(200)
    expect(res.body[0].elo).toBe(100)
    expect(prisma.leaderboard.findMany).toHaveBeenCalled()
  })
})
