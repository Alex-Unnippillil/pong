import request from 'supertest'
import { createServerFromHandler } from '../../../../test/test-utils'
import { POST } from './route'
import { redis } from '@/lib/redis'

vi.mock('@/lib/redis', () => ({
  redis: { lpush: vi.fn() },
}))

describe('POST /api/matchmaking', () => {
  it('returns a roomId and enqueues it', async () => {
    const server = createServerFromHandler(POST)
    const res = await request(server).post('/api/matchmaking').expect(200)
    expect(res.body.roomId).toBeDefined()
    expect(redis.lpush).toHaveBeenCalled()
  })
})
