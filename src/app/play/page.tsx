'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function PlayPage() {
  const router = useRouter()
  const t = useTranslations('play')
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
          setReason(t('matchmakingError'))
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
      setReason(t('matchmakingTimeout'))
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === 'AbortError')
      ) {
        setStatus('aborted')
        setReason(t('matchmakingAborted'))
      } else if (err instanceof TypeError) {
        setStatus('error')
        setReason(t('serverUnreachable'))
      } else {
        setStatus('error')
        setReason(t('matchmakingError'))
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
          {t('playOnline')}
        </button>
      )}
      {status === 'searching' && <p>{t('searching')}</p>}
      {status === 'timeout' && (
        <div className="flex flex-col items-center gap-2">
          <p>{reason || t('queueTimedOut')}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={retry}
          >
            {t('retry')}
          </button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-2">
          <p>{reason || t('somethingWentWrong')}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={retry}
          >
            {t('retry')}
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
            {t('retry')}
          </button>
        </div>
      )}
    </main>
  )
}
