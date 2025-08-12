import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { getServerAuthSession } from '@/lib/auth'
import { redis } from '@/lib/redis'

export const runtime = 'edge'

