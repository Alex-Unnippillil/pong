import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
=======
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

vi.mock('posthog-js', () => ({
  default: { init: vi.fn() },
}))

describe('initAnalytics', () => {
  const originalEnv = process.env

=======
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

=======
  afterAll(() => {
    process.env = originalEnv
  })

  it('initializes analytics with key only', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
    const posthog = (await import('posthog-js')).default
    const { initAnalytics } = await import('./analytics')
    vi.stubGlobal('window', {})
    initAnalytics()
    expect(posthog.init).toHaveBeenCalledWith('test-key')
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
=======
  it('initializes posthog with api_host when host is defined', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'
    const posthog = await import('posthog-js')
    const { initAnalytics } = await import('./analytics')

    initAnalytics()

    expect(posthog.default.init).toHaveBeenCalledWith('ph_key', {
      api_host: 'https://app.posthog.com',
    })
  })

  it('initializes posthog without options when host is undefined', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'ph_key'
    const posthog = await import('posthog-js')
    const { initAnalytics } = await import('./analytics')

    initAnalytics()

    expect(posthog.default.init).toHaveBeenCalledWith('ph_key', undefined)
  })
})

