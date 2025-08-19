'use client'

import React from 'react'
import { useSettings } from '../store/settings'
import { Button } from './ui/Button'

export function MuteButton() {
  const muted = useSettings((s) => s.muted)
  const toggleMuted = useSettings((s) => s.toggleMuted)

  return (
    <Button
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute' : 'Mute'}
      variant="secondary"
    >
      {muted ? 'Unmute' : 'Mute'}
    </Button>
  )
}

export default MuteButton
