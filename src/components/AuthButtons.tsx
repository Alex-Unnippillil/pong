'use client'

import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

export function AuthButtons() {
  const { data: session } = useSession()

  if (session?.user) {
    const userLabel = session.user.email ?? session.user.name ?? 'User'
    return (
      <div>
        <span>Signed in as {userLabel}</span>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return <button onClick={() => signIn()}>Sign in</button>
}

export default AuthButtons
