import posthog from 'posthog-js'
import { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } from '@/env'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  const key = NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: NEXT_PUBLIC_POSTHOG_HOST,
  })
}
