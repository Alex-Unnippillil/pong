import { beforeEach, describe, expect, it, vi } from 'vitest'

const baseEnv = {
  EMAIL_SERVER: 'smtp://localhost',
  EMAIL_FROM: 'noreply@example.com',
  GITHUB_ID: 'id',
  GITHUB_SECRET: 'secret',
  AUTH_SECRET: 'auth',
  UPSTASH_REDIS_URL: 'https://example.com',
  UPSTASH_REDIS_TOKEN: 'token',
}

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env = { ...originalEnv, ...baseEnv }
  vi.resetModules()
})

describe('env', () => {
  it('throws on missing environment variables', async () => {
    delete process.env.AUTH_SECRET
    await expect(import('./env')).rejects.toThrow(/AUTH_SECRET/)
  })

  it('throws on invalid environment variables', async () => {
    process.env.UPSTASH_REDIS_URL = 'not-a-url'
    await expect(import('./env')).rejects.toThrow(/UPSTASH_REDIS_URL/)
  })
})
