import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))
import posthog from 'posthog-js'
const capture = posthog.capture as ReturnType<typeof vi.fn>

import {
  trackGameStart,
  trackGameEnd,
  trackLeaderboardView,
  trackMatchmakingStart,
  trackMatchmakingSuccess,
  trackSettingsChange,
  trackPwaInstall,
} from './events'

describe('events', () => {
  beforeEach(() => {
    capture.mockClear()
  })

  test('trackGameStart', () => {
    trackGameStart('classic')
    expect(capture).toHaveBeenCalledWith('game_start', { mode: 'classic' })
  })

  test('trackGameEnd', () => {
    trackGameEnd('classic', 'player')
    expect(capture).toHaveBeenCalledWith('game_end', {
      mode: 'classic',
      winner: 'player',
    })
  })

  test('trackLeaderboardView', () => {
    trackLeaderboardView()
    expect(capture).toHaveBeenCalledWith('leaderboard_view')
  })

  test('trackMatchmakingStart', () => {
    trackMatchmakingStart('classic')
    expect(capture).toHaveBeenCalledWith('matchmaking_start', {
      mode: 'classic',
    })
  })

  test('trackMatchmakingSuccess', () => {
    trackMatchmakingSuccess('classic', 42)
    expect(capture).toHaveBeenCalledWith('matchmaking_success', {
      mode: 'classic',
      duration: 42,
    })
  })

  test('trackSettingsChange', () => {
    trackSettingsChange('sound', 'on')
    expect(capture).toHaveBeenCalledWith('settings_change', {
      setting: 'sound',
      value: 'on',
    })
  })

  test('trackPwaInstall', () => {
    trackPwaInstall()
    expect(capture).toHaveBeenCalledWith('pwa_install')
  })
})
