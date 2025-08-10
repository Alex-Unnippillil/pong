import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('../auth/[...nextauth]/route', () => ({ authOptions: {} }), {
  virtual: true,
})

vi.mock('@/lib/redis', () => {
  const queues = new Map<string, string[]>()
  const waiters = new Map<string, ((v: [string, string]) => void)[]>()

  function resolve(key: string, value: string) {
    const res = waiters.get(key)?.shift()
    if (res) res([key, value])
  }

  return {
    redis: {
      lpush: vi.fn(async (key: string, value: string) => {
        const q = queues.get(key) ?? []
        q.unshift(value)
        queues.set(key, q)
        const waiter = waiters.get(key)?.shift()
        if (waiter) {
          const v = q.pop()!
          waiter([key, v])
        }
      }),
      rpop: vi.fn(async (key: string) => {
        const q = queues.get(key)
        return q && q.length ? q.pop()! : null
      }),
      brpop: vi.fn(async (key: string) => {
        const q = queues.get(key)
        if (q && q.length) return [key, q.pop()!]
        return new Promise<[string, string]>((res) => {
          const arr = waiters.get(key) ?? []
          arr.push(res)
          waiters.set(key, arr)
        })
      }),
      __queues: queues,
      __reset: () => {
        queues.clear()
        waiters.clear()
      },
    },
  }
})

import { POST } from './route'
import { redis } from '@/lib/redis'
import { getServerSession } from 'next-auth'

describe('matchmaking', () => {
  beforeEach(() => {
    ;(redis as any).__reset()
    ;(getServerSession as any).mockReset()
  })

  it('queues single user until opponent joins', async () => {
    ;(getServerSession as any).mockResolvedValueOnce({ user: { id: 'alice' } })
    const first = POST()

    // ensure first user is queued
    await new Promise((r) => setTimeout(r, 0))
    expect((redis as any).__queues.get('matchmaking')).toEqual(['alice'])
    ;(getServerSession as any).mockResolvedValueOnce({ user: { id: 'bob' } })
    const second = POST()

    const [res1, res2] = await Promise.all([first, second])
    const data1 = await res1.json()
    const data2 = await res2.json()
    expect(data1).toMatchObject({ opponentId: 'bob' })
    expect(data2).toMatchObject({ opponentId: 'alice' })
    expect(data1.roomId).toBe(data2.roomId)
  })

  it('pairs simultaneous matchmaking requests', async () => {
    ;(getServerSession as any).mockResolvedValueOnce({ user: { id: 'carol' } })
    const p1 = POST()
    await new Promise((r) => setTimeout(r, 0))
    ;(getServerSession as any).mockResolvedValueOnce({ user: { id: 'dave' } })
    const p2 = POST()

    const [res1, res2] = await Promise.all([p1, p2])
    const data1 = await res1.json()
    const data2 = await res2.json()
    expect(data1).toMatchObject({ opponentId: 'dave' })
    expect(data2).toMatchObject({ opponentId: 'carol' })
    expect(data1.roomId).toBe(data2.roomId)
  })
})
