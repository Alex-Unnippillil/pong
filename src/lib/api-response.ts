import { NextResponse } from 'next/server'

function logError(message: string, status: number) {
  console.error('API error', { status, message })
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function error(message: string, status = 500) {
  logError(message, status)
  return NextResponse.json({ error: message }, { status })
}
