import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const originalEnv = { ...process.env }

vi.mock('posthog-js', () => ({
  default: { init: vi.fn() },
}))

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
}))

describe('initAnalytics', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('initializes analytics with key only', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    const posthog = (await import('posthog-js')).default
    const { initAnalytics } = await import('./analytics')
    vi.stubGlobal('window', {})
    initAnalytics()
    expect(posthog.init).toHaveBeenCalledWith('test-key', undefined)
  })

  it('initializes analytics with key and host', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.host'
    const posthog = (await import('posthog-js')).default
    const { initAnalytics } = await import('./analytics')
    vi.stubGlobal('window', {})
    initAnalytics()
    expect(posthog.init).toHaveBeenCalledWith('test-key', {
      api_host: 'https://test.host',
    })
  })

  it('initializes Sentry when DSN is provided', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.com/1'
    const Sentry = await import('@sentry/react')
    const { initAnalytics } = await import('./analytics')
    vi.stubGlobal('window', {})
    initAnalytics()
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'https://example.com/1',
    })
  })
})

describe('logTelemetry', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts telemetry event', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetch)
    const { logTelemetry } = await import('./analytics')
    await logTelemetry('match_chat', { matchId: '1' })
    expect(fetch).toHaveBeenCalledWith(
      '/api/telemetry',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
