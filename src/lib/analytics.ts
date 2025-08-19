import posthog from 'posthog-js'
import * as Sentry from '@sentry/react'

import { env } from '@/lib/env.client'

interface AnalyticsGlobal {
  Sentry?: typeof Sentry
}

export function initAnalytics() {
  if (typeof window === 'undefined') return

  if (env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN })
    ;(window as AnalyticsGlobal).Sentry = Sentry
  }

  const key = env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const options = env.NEXT_PUBLIC_POSTHOG_HOST
    ? { api_host: env.NEXT_PUBLIC_POSTHOG_HOST }
    : undefined

  posthog.init(key, options)
}
