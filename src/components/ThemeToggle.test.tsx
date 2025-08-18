import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeToggle } from './ThemeToggle'
import { useSettings } from '../store/settings'

beforeEach(() => {
  useSettings.persist.clearStorage()
  localStorage.clear()
  useSettings.setState({ muted: false, theme: 'light' })
})

describe('ThemeToggle', () => {
  it('toggles theme and updates label', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Dark')

    fireEvent.click(button)
    expect(button).toHaveTextContent('Light')
    expect(useSettings.getState().theme).toBe('dark')

    fireEvent.click(button)
    expect(button).toHaveTextContent('Dark')
    expect(useSettings.getState().theme).toBe('light')
  })
})
