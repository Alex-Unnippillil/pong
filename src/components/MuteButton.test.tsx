import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MuteButton } from './MuteButton'
import { useSettings } from '../store/settings'

beforeEach(() => {
  useSettings.persist.clearStorage()
  localStorage.clear()
  useSettings.setState({ muted: false })
})

describe('MuteButton', () => {
  it('toggles muted state and updates label', () => {
    render(<MuteButton />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Mute')

    fireEvent.click(button)
    expect(button).toHaveTextContent('Unmute')
    expect(useSettings.getState().muted).toBe(true)

    fireEvent.click(button)
    expect(button).toHaveTextContent('Mute')
    expect(useSettings.getState().muted).toBe(false)
  })
})
