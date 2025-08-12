import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

// Mock auth and redis modules used by API routes to avoid touching real
// services during unit tests. Individual tests can adjust the behaviour of
// these mocks as needed.
vi.mock('@/lib/auth', () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({ user: { id: 'user-id' } }),
}))

vi.mock('@/lib/redis', () => {
  const redis = {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(null),
    lpop: vi.fn(),
    lpos: vi.fn(),
    rpush: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  }
  return { redis }
})

afterEach(() => {
  vi.clearAllMocks()
})

function jsonRequest(body: unknown, init: RequestInit = {}) {
  return new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
}

// expose helper globally for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).jsonRequest = jsonRequest

export {}

declare global {
  var jsonRequest: typeof jsonRequest
}
