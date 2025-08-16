import posthog from 'posthog-js'

import { env } from '@/lib/env.client'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  const key = env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  })
}
