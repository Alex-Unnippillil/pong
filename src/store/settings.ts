import { create } from 'zustand'
import { track } from '../lib/analytics'

interface SettingsState {
  muted: boolean
  toggleMuted: () => void
}

export const useSettings = create<SettingsState>((set) => ({
  muted: false,
  toggleMuted: () =>
    set((s) => {
      const next = !s.muted
      track('settings_change', { setting: 'muted', value: next })
      return { muted: next }
    }),
}))
