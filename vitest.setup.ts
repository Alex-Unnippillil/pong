import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

process.env.EMAIL_SERVER = process.env.EMAIL_SERVER ?? 'smtp://localhost'
process.env.EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@example.com'
process.env.GITHUB_ID = process.env.GITHUB_ID ?? 'id'
process.env.GITHUB_SECRET = process.env.GITHUB_SECRET ?? 'secret'
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'auth'
process.env.UPSTASH_REDIS_URL =
  process.env.UPSTASH_REDIS_URL ?? 'https://example.com'
process.env.UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN ?? 'token'

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
  // eslint-disable-next-line no-var
  var jsonRequest: typeof jsonRequest
}
