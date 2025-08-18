import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

const originalEnv = process.env

const baseEnv: NodeJS.ProcessEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: 'ph_key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  NEXT_PUBLIC_SUPABASE_URL: 'https://supabase.example.com',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
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
    const { env } = await import('./env.server')
    expect(env.DATABASE_URL).toBe(baseEnv.DATABASE_URL)
    expect(env.NEXTAUTH_URL).toBe(baseEnv.NEXTAUTH_URL)
    expect(env.MATCHMAKING_QUEUE_TTL_SECONDS).toBe(60)
    expect(env.MATCH_TTL_SECONDS).toBe(3600)
  })

  it('allows optional env vars to be undefined', async () => {
    delete process.env.EMAIL_SERVER
    const { env } = await import('./env.server')
    expect(env.EMAIL_SERVER).toBeUndefined()
  })

  it('uses default NEXTAUTH_URL when missing', async () => {
    delete process.env.NEXTAUTH_URL
    const { env } = await import('./env.server')
    expect(env.NEXTAUTH_URL).toBe('http://localhost:3000')
  })

  it('uses default AUTH_SECRET when missing', async () => {
    delete process.env.AUTH_SECRET
    const { env } = await import('./env.server')
    expect(env.AUTH_SECRET).toBe('dev-secret')
  })

  it('throws when MATCHMAKING_QUEUE_TTL_SECONDS is invalid', async () => {
    process.env.MATCHMAKING_QUEUE_TTL_SECONDS = 'abc'
    await expect(import('./env.server')).rejects.toThrow(
      /MATCHMAKING_QUEUE_TTL_SECONDS/,
    )
  })

  it('throws when MATCH_TTL_SECONDS is invalid', async () => {
    process.env.MATCH_TTL_SECONDS = 'abc'
    await expect(import('./env.server')).rejects.toThrow(/MATCH_TTL_SECONDS/)
  })

  it('throws when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL
    await expect(import('./env.server')).rejects.toThrow(/DATABASE_URL/)
  })

  it('throws when NEXTAUTH_URL is invalid', async () => {
    process.env.NEXTAUTH_URL = 'invalid-url'
    await expect(import('./env.server')).rejects.toThrow(/NEXTAUTH_URL/)
  })
})

describe('client env validation', () => {
  it('loads public variables', async () => {
    const { env } = await import('./env.client')
    expect(env.NEXT_PUBLIC_POSTHOG_KEY).toBe(baseEnv.NEXT_PUBLIC_POSTHOG_KEY)
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(baseEnv.NEXT_PUBLIC_SUPABASE_URL)
  })

  it('throws when NEXT_PUBLIC_POSTHOG_HOST is invalid', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'not-a-url'
    await expect(import('./env.client')).rejects.toThrow(
      /NEXT_PUBLIC_POSTHOG_HOST/,
    )
  })

  it('does not expose server variables', async () => {
    const { env: clientEnv } = await import('./env.client')
    expect((clientEnv as Record<string, unknown>).DATABASE_URL).toBeUndefined()
  })
})
