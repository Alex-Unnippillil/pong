'use client'

import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from './ui/Button'

export function AuthButtons() {
  const { data: session } = useSession()

  if (session?.user) {
    const userLabel = session.user.email ?? session.user.name ?? 'User'
    return (
      <div>
        <span>Signed in as {userLabel}</span>
        <Button onClick={() => signOut()} variant="primary">
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={() => signIn()} variant="primary">
      Sign in
    </Button>
  )
}

export default AuthButtons
