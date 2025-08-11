import { describe, it, expect, beforeEach } from 'vitest'
import { useSettings } from './settings'

beforeEach(() => {
  useSettings.persist.clearStorage()
  localStorage.clear()
  useSettings.setState({ muted: false })
})

describe('settings store', () => {
  it('toggles muted flag and persists', () => {
    expect(useSettings.getState().muted).toBe(false)
    useSettings.getState().toggleMuted()
    expect(useSettings.getState().muted).toBe(true)
    expect(JSON.parse(localStorage.getItem('settings')!).state.muted).toBe(true)
  })

  it('rehydrates state from storage', async () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({ state: { muted: true }, version: 0 }),
    )

    await useSettings.persist.rehydrate()
    expect(useSettings.getState().muted).toBe(true)
  })
})
