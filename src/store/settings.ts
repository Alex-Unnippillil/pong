import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  muted: boolean
  toggleMuted: () => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      theme: 'light',
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'settings' },
  ),
)
