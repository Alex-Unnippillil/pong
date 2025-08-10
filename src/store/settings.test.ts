import { renderHook, act } from '@testing-library/react'
import { useSettings } from './settings'

test('toggleMuted flips state', () => {
  const { result } = renderHook(() => useSettings())
  expect(result.current.muted).toBe(false)
  act(() => result.current.toggleMuted())
  expect(result.current.muted).toBe(true)
})
