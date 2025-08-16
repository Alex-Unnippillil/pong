'use client'

import React from 'react'
import { useSettings } from '../store/settings'

export function MuteButton() {
  const muted = useSettings((s) => s.muted)
  const toggleMuted = useSettings((s) => s.toggleMuted)

  return (
    <button onClick={toggleMuted} aria-label={muted ? 'Unmute' : 'Mute'}>
      {muted ? 'Unmute' : 'Mute'}
    </button>
  )
}

export default MuteButton
