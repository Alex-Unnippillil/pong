import React from 'react'
import { render } from '@testing-library/react'
import { AnalyticsProvider } from './AnalyticsProvider'
import { initAnalytics } from '../lib/analytics'

vi.mock('../lib/analytics', () => ({ initAnalytics: vi.fn() }))

test('initializes analytics on mount', () => {
  render(<AnalyticsProvider />)
  expect(initAnalytics).toHaveBeenCalled()
})
