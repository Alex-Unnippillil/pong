import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthButtons } from './AuthButtons'
import { signIn, signOut, useSession } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(),
}))

const mockUseSession = vi.mocked(useSession)
const mockSignIn = vi.mocked(signIn)
const mockSignOut = vi.mocked(signOut)

describe('AuthButtons', () => {
  it('renders sign in button when unauthenticated and calls signIn on click', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<AuthButtons />)
    const button = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(button)
    expect(mockSignIn).toHaveBeenCalled()
  })

  it('renders sign out and session info when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Alice', email: 'alice@example.com' } },
      status: 'authenticated',
    })
    render(<AuthButtons />)
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(button)
    expect(mockSignOut).toHaveBeenCalled()
  })
})
