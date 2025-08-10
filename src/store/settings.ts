import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
      name: 'pong-settings',
      version: 1,
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            muted:
              (persistedState as SettingsState | undefined)?.muted ?? false,
          }
        }
        return persistedState as SettingsState
      },
    },
  ),
)
