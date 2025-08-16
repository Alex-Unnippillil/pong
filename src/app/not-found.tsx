import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link href="/" className="text-blue-500 underline">
        Go home
      </Link>
    </main>
  )
}
