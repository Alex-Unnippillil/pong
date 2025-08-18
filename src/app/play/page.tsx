'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function PlayPage() {
  const router = useRouter()
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'timeout' | 'error' | 'aborted'
  >('idle')
  const [reason, setReason] = useState('')
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
    setReason('')
    const start = Date.now()
    const TIMEOUT_MS = 15000
    let attempt = 0
    try {
      while (Date.now() - start < TIMEOUT_MS) {
        const res = await fetch('/api/matchmaking', {
          method: 'POST',
          signal: controller.signal,
        })
        if (!res.ok) {
          setStatus('error')
          setReason('Matchmaking error')
          return
        }
        const data = await res.json()
        if (data.matchId) {
          router.push(`/match/${data.matchId}`)
          return
        }
        const delay = Math.min(1000 * 2 ** attempt, 8000)
        attempt++
        await new Promise((r) => setTimeout(r, delay))
      }
      setStatus('timeout')
      setReason('No match found before timeout')
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === 'AbortError')
      ) {
        setStatus('aborted')
        setReason('Matchmaking aborted')
      } else if (err instanceof TypeError) {
        setStatus('error')
        setReason('Server unreachable')
      } else {
        setStatus('error')
        setReason('Matchmaking error')
      }
    } finally {
      controller.abort()
      controllerRef.current = null
      setStatus((prev) => (prev === 'searching' ? 'idle' : prev))
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
          <p>{reason || 'Queue timed out.'}</p>
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
          <p>{reason || 'Something went wrong.'}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={retry}
          >
            Retry
          </button>
        </div>
      )}
      {status === 'aborted' && (
        <div className="flex flex-col items-center gap-2">
          <p>{reason}</p>
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
