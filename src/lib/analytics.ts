import posthog from 'posthog-js'

let initialized = false

export function initAnalytics() {
  if (initialized) return
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })
  initialized = true
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!initialized) initAnalytics()
  if (!initialized) return
  posthog.capture(event, properties)
}
