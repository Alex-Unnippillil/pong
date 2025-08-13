import { NextResponse, type NextResponseInit } from 'next/server'

export function ok<T>(data: T, init: NextResponseInit = {}) {
  return NextResponse.json(data, init)
}

export function error(message: string, status: number) {
  console.error('API error', { message, status })
  return NextResponse.json({ error: message }, { status })
}
