import { describe, it, expect, vi, type Mock } from 'vitest'

vi.mock('../../../lib/redis', () => ({
  redis: {
    lpop: vi.fn(),
    lrange: vi.fn(),
    rpush: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  },
}))

vi.mock('../../../lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

import { POST, GET } from './route'
import { redis } from '../../../lib/redis'
import { getServerAuthSession } from '../../../lib/auth'

describe('matchmaking API', () => {
  it('queues player when no opponent available', async () => {
    ;(getServerAuthSession as Mock).mockResolvedValue({ user: { id: 'p1' } })
    ;(redis.lpop as Mock).mockResolvedValue(null)
    ;(redis.lrange as Mock).mockResolvedValue([])
    ;(redis.rpush as Mock).mockResolvedValue(1)

    const res = await POST(new Request('http://localhost'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ matchId: null })
    expect(redis.rpush).toHaveBeenCalledWith('matchmaking:queue', 'p1')
  })

  it('matches players when opponent available', async () => {
    ;(getServerAuthSession as Mock).mockResolvedValue({ user: { id: 'p2' } })
    ;(redis.lpop as Mock).mockResolvedValue('p1')
    ;(redis.set as Mock).mockResolvedValue('OK')

    const res = await POST(new Request('http://localhost'))
    const json = await res.json()

    expect(res.status).toBe(200)
    const matchId = json.matchId
    expect(typeof matchId).toBe('string')
    expect(redis.set).toHaveBeenCalledWith('matchmaking:match:p2', matchId)
    expect(redis.set).toHaveBeenCalledWith('matchmaking:match:p1', matchId)
    expect(redis.rpush).not.toHaveBeenCalled()
    ;(getServerAuthSession as Mock).mockResolvedValue({ user: { id: 'p1' } })
    ;(redis.get as Mock).mockResolvedValue(matchId)
    ;(redis.del as Mock).mockResolvedValue(1)

    const getRes = await GET(new Request('http://localhost'))
    const getJson = await getRes.json()

    expect(getRes.status).toBe(200)
    expect(getJson).toEqual({ matchId })
    expect(redis.del).toHaveBeenCalledWith('matchmaking:match:p1')
  })

  it('rejects unauthorized users', async () => {
    ;(getServerAuthSession as Mock).mockResolvedValue(null)

    const res = await POST(new Request('http://localhost'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'unauthorized' })

    const getRes = await GET(new Request('http://localhost'))
    expect(getRes.status).toBe(401)
  })
})
