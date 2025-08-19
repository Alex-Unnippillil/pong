import posthog from 'posthog-js'

import { env } from '@/lib/env.client'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  const key = env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const options = env.NEXT_PUBLIC_POSTHOG_HOST
    ? { api_host: env.NEXT_PUBLIC_POSTHOG_HOST }
    : undefined

  posthog.init(key, options)
}

export async function logTelemetry(
  eventType: string,
  payload: Record<string, unknown>,
) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType, payload }),
    })
  } catch (err) {
    console.warn('telemetry failed', err)
  }
}
