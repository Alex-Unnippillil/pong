import { NextResponse } from 'next/server'
import type { z } from 'zod'

export function error(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function parseBody<T>(
  schema: z.Schema<T>,
  req: Request,
): Promise<[T | null, NextResponse | null]> {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return [null, error(400, 'invalid')]
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return [null, error(400, 'invalid')]
  }
  return [parsed.data, null]
}
