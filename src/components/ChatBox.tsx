'use client'

import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

interface ChatBoxProps {
  matchId: string
}

export function ChatBox({ matchId }: ChatBoxProps) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel(`chat:${matchId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload.message as string])
      })
    channelRef.current = channel
    void channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [matchId])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((prev) => [...prev, text])
    void channelRef.current?.send({
      type: 'broadcast',
      event: 'message',
      payload: { message: text },
    })
  }

  return (
    <div className="mt-4 w-full max-w-md">
      <ul className="mb-2 max-h-48 overflow-y-auto border p-2">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border p-1"
        />
        <button type="submit" className="border px-2">
          Send
        </button>
      </form>
    </div>
  )
}
