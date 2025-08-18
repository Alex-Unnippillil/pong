'use client'

import React from 'react'
import { useSettings } from '../store/settings'

export function ThemeToggle() {
  const theme = useSettings((s) => s.theme)
  const toggleTheme = useSettings((s) => s.toggleTheme)

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  )
}

export default ThemeToggle
