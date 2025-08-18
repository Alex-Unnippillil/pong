'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function PlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<
    'idle' | 'searching' | 'timeout' | 'error' | 'joining'
  >('idle')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
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

  const createChallenge = async () => {
    setStatus('searching')
    try {
      const res = await fetch('/api/challenge', { method: 'POST' })
      if (!res.ok) {
        setStatus('error')
        return
      }
      const { token } = await res.json()
      const link = `${window.location.origin}/play?token=${token}`
      setInviteLink(link)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!token) return
    setStatus('joining')
    const accept = async () => {
      try {
        const res = await fetch(`/api/challenge/${token}`)
        if (!res.ok) {
          setStatus('error')
          return
        }
        const data = await res.json()
        router.push(`/match/${data.matchId}`)
      } catch {
        setStatus('error')
      }
    }
    void accept()
  }, [token, router])

  const retry = () => {
    void queueForMatch()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={queueForMatch}
          >
            Play Online
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={createChallenge}
          >
            Invite a Friend
          </button>
          {inviteLink && <p className="break-all text-center">{inviteLink}</p>}
        </div>
      )}
      {status === 'searching' && <p>Searching for an opponent...</p>}
      {status === 'joining' && <p>Joining match...</p>}
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
