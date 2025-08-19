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
})
