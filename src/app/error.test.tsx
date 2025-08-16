import React from 'react'
import { render, screen } from '@testing-library/react'
import Error from './error'

describe('Error page', () => {
  it('renders message and home link', () => {
    render(<Error />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
