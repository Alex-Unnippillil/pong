import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

describe('NotFound page', () => {
  it('renders message and home link', () => {
    render(<NotFound />)
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
