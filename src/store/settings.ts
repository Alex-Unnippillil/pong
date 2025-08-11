import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  muted: boolean
  toggleMuted: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    { name: 'settings' },
  ),
)
