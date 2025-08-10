import posthog from 'posthog-js'
import { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } from '@/lib/env'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  posthog.init(NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: NEXT_PUBLIC_POSTHOG_HOST,
  })
}
