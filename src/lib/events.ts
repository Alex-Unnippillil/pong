import posthog from 'posthog-js'

export function trackGameStart(mode: string) {
  posthog.capture('game_start', { mode })
}

export function trackGameEnd(mode: string, winner: string) {
  posthog.capture('game_end', { mode, winner })
}

export function trackLeaderboardView() {
  posthog.capture('leaderboard_view')
}

export function trackMatchmakingStart(mode: string) {
  posthog.capture('matchmaking_start', { mode })
}

export function trackMatchmakingSuccess(mode: string, duration: number) {
  posthog.capture('matchmaking_success', { mode, duration })
}

export function trackSettingsChange(setting: string, value: string) {
  posthog.capture('settings_change', { setting, value })
}

export function trackPwaInstall() {
  posthog.capture('pwa_install')
}
