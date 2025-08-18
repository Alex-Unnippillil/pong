import posthog from 'posthog-js'

import { env } from '@/lib/env.client'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  const key = env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  if (env.NEXT_PUBLIC_POSTHOG_HOST) {
    posthog.init(key, { api_host: env.NEXT_PUBLIC_POSTHOG_HOST })
  } else {
    posthog.init(key)
  }
=======
  const options = env.NEXT_PUBLIC_POSTHOG_HOST
    ? { api_host: env.NEXT_PUBLIC_POSTHOG_HOST }
    : undefined
  posthog.init(key, options)
}
