'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function PlayPage() {
  const router = useRouter()
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'timeout' | 'error'
  >('idle')
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
      setStatus('idle')
    }
  }, [])

  const queueForMatch = async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setStatus('searching')
    const start = Date.now()
    const TIMEOUT_MS = 15000
    try {
      while (Date.now() - start < TIMEOUT_MS) {
        const res = await fetch('/api/matchmaking', {
          method: 'POST',
          signal: controller.signal,
        })
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
      if (controller.signal.aborted) {
        setStatus('idle')
      } else {
        setStatus('error')
      }
    } finally {
      controller.abort()
      controllerRef.current = null
      setStatus((prev) => (prev === 'searching' ? 'idle' : prev))
    }
  }

  const cancel = async () => {
    controllerRef.current?.abort()
    setStatus('idle')
    try {
      await fetch('/api/matchmaking', { method: 'DELETE' })
    } catch {
      // ignore
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
      {status === 'searching' && (
        <div className="flex flex-col items-center gap-2">
          <p>Searching for an opponent...</p>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={cancel}
          >
            Cancel
          </button>
        </div>
      )}
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
