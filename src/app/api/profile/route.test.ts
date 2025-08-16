import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'
import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  getServerAuthSession: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      upsert: vi.fn(),
    },
  },
}))

describe('POST /api/profile', () => {
  const session = { user: { id: 'user-id' } }

  it('updates profile with valid data', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(session)
    const form = new FormData()
    form.set('displayName', 'Alice')
    form.set('avatarUrl', 'https://example.com/avatar.png')
    const req = new Request('http://localhost/api/profile', {
      method: 'POST',
      body: form,
    })

    const res = await POST(req)

    expect(prisma.profile.upsert).toHaveBeenCalledWith({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        displayName: 'Alice',
        avatarUrl: 'https://example.com/avatar.png',
      },
      update: {
        displayName: 'Alice',
        avatarUrl: 'https://example.com/avatar.png',
      },
    })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('http://localhost/profile')
  })

  it('redirects unauthenticated users', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(null)
    const req = new Request('http://localhost/api/profile', {
      method: 'POST',
      body: new FormData(),
    })

    const res = await POST(req)

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('http://localhost/api/auth/signin')
    expect(prisma.profile.upsert).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid fields', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(session)
    const form = new FormData()
    form.set('avatarUrl', 'invalid-url')
    const req = new Request('http://localhost/api/profile', {
      method: 'POST',
      body: form,
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(prisma.profile.upsert).not.toHaveBeenCalled()
  })
})

