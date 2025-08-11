import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

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
