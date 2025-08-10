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
    {
      name: 'settings',
      version: 1,
      migrate: (persistedState, version) => {
        switch (version) {
          case 0:
            return { muted: (persistedState as any)?.muted ?? false }
          default:
            return persistedState as SettingsState
        }
      },
    },
  ),
)
