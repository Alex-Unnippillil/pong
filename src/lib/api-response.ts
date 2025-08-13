import { NextResponse } from 'next/server'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function error(message: string, status = 500) {
  console.error('API error', { status, message })
  return NextResponse.json({ error: message }, { status })
}
