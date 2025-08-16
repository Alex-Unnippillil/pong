'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'

let initialized = false

export function AnalyticsProvider() {
  useEffect(() => {
    if (!initialized && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      initAnalytics()
      initialized = true
    }
  }, [])
  return null
}
