'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'
import { env } from '@/lib/env.client'

let initialized = false

export function AnalyticsProvider() {
  useEffect(() => {
    if (!initialized && env.NEXT_PUBLIC_POSTHOG_KEY) {
      initAnalytics()
      initialized = true
    }
  }, [])
  return null
}
