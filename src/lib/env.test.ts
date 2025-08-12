import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

const baseEnv: NodeJS.ProcessEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: 'ph_key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  EMAIL_SERVER: 'smtp://user:pass@localhost',
  EMAIL_FROM: 'noreply@example.com',
  GITHUB_ID: 'id',
  GITHUB_SECRET: 'secret',
  GOOGLE_ID: 'gid',
  GOOGLE_SECRET: 'gsecret',
  AUTH_SECRET: 'secret',
  UPSTASH_REDIS_URL: 'https://redis.example.com',
  UPSTASH_REDIS_TOKEN: 'token',
  SUPABASE_URL: 'https://supabase.example.com',
  SUPABASE_KEY: 'supabase-key',
  NEXTAUTH_URL: 'http://localhost:3000',
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...baseEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('env validation', () => {
  it('parses environment variables', async () => {
    const { env } = await import('./env')
    expect(env.DATABASE_URL).toBe(baseEnv.DATABASE_URL)
  })

  it('throws when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL
    await expect(import('./env')).rejects.toThrow(/DATABASE_URL/)
  })

  it('throws when DATABASE_URL is invalid', async () => {
    process.env.DATABASE_URL = 'not-a-url'
    await expect(import('./env')).rejects.toThrow(/DATABASE_URL/)
  })
})
