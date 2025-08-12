import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

const baseEnv: NodeJS.ProcessEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: 'ph_key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  EMAIL_SERVER: 'smtp://user:pass@localhost',
  EMAIL_FROM: 'noreply@example.com',
  GITHUB_ID: 'id',
  GITHUB_SECRET: 'secret',
  AUTH_SECRET: 'secret',
  UPSTASH_REDIS_URL: 'https://redis.example.com',
  UPSTASH_REDIS_TOKEN: 'token',
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...baseEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('env validation', () => {
  it('throws when required env var is missing', async () => {
    delete process.env.EMAIL_SERVER
    await expect(import('./env')).rejects.toThrow(/EMAIL_SERVER/)
  })

  it('throws when env var fails validation', async () => {
    process.env.UPSTASH_REDIS_URL = 'not-a-url'
    await expect(import('./env')).rejects.toThrow(/UPSTASH_REDIS_URL/)
  })
})
