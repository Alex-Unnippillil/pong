'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PlayPage() {
  const router = useRouter()
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'timeout' | 'error'
  >('idle')

  const queueForMatch = async () => {
    setStatus('searching')
    const start = Date.now()
    const TIMEOUT_MS = 15000
    try {
      while (Date.now() - start < TIMEOUT_MS) {
        const res = await fetch('/api/matchmaking', { method: 'POST' })
        if (!res.ok) {
          setStatus('error')
          return
        }
        const data = await res.json()
        if (data.matchId) {
          router.push(`/match/${data.matchId}`)
          return
        }
        await new Promise((r) => setTimeout(r, 1000))
      }
      setStatus('timeout')
    } catch {
      setStatus('error')
    }
  }

  const retry = () => {
    void queueForMatch()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {status === 'idle' && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={queueForMatch}
        >
          Play Online
        </button>
      )}
      {status === 'searching' && <p>Searching for an opponent...</p>}
      {status === 'timeout' && (
        <div className="flex flex-col items-center gap-2">
          <p>Queue timed out.</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-2">
          <p>Something went wrong.</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      )}
    </main>
  )
}
