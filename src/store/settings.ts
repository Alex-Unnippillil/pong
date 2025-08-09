import { create } from 'zustand'

interface SettingsState {
  muted: boolean
  toggleMuted: () => void
}

export const useSettings = create<SettingsState>((set) => ({
  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
}))
