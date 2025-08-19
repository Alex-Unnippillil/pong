'use client'

import { useEffect, useState, FormEvent } from 'react'

import { supabase } from '@/lib/supabase'
import { logTelemetry } from '@/lib/analytics'

interface Message {
  id: string
  userId: string
  message: string
  createdAt: string
}

export function ChatPanel({ matchId }: { matchId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/chat/${matchId}`)
      if (res.ok) {
        const data = (await res.json()) as Message[]
        setMessages(data)
      }
    }
    load()
  }, [matchId])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message])
      })
      .subscribe()
    return () => {
      channel.unsubscribe()
    }
  }, [matchId])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await fetch(`/api/chat/${matchId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
    logTelemetry('match_chat', { matchId })
  }

  return (
    <div>
      <div>
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.userId}</strong>: {m.message}
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </div>
  )
}
