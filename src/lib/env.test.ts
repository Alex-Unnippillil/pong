import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

const baseEnv: NodeJS.ProcessEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: 'ph_key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  NEXTAUTH_URL: 'http://localhost:3000',
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
  it('loads required variables', async () => {
    const { env } = await import('./env')
    expect(env.DATABASE_URL).toBe(baseEnv.DATABASE_URL)
    expect(env.NEXTAUTH_URL).toBe(baseEnv.NEXTAUTH_URL)
    expect(env.MATCHMAKING_QUEUE_TTL_SECONDS).toBe(60)
  })

  it('throws when required env var is missing', async () => {
    delete process.env.EMAIL_SERVER
    await expect(import('./env')).rejects.toThrow(/EMAIL_SERVER/)
  })

  it('throws when env var fails validation', async () => {
    process.env.UPSTASH_REDIS_URL = 'not-a-url'
    await expect(import('./env')).rejects.toThrow(/UPSTASH_REDIS_URL/)
  })

  it('throws when MATCHMAKING_QUEUE_TTL_SECONDS is invalid', async () => {
    process.env.MATCHMAKING_QUEUE_TTL_SECONDS = 'abc'
    await expect(import('./env')).rejects.toThrow(
      /MATCHMAKING_QUEUE_TTL_SECONDS/,
    )
  })

  it('throws when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL
    await expect(import('./env')).rejects.toThrow(/DATABASE_URL/)
  })

  it('throws when NEXTAUTH_URL is invalid', async () => {
    process.env.NEXTAUTH_URL = 'invalid-url'
    await expect(import('./env')).rejects.toThrow(/NEXTAUTH_URL/)
  })
})
