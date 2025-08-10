import { test, expect } from '@playwright/test'

test('session endpoint returns null when unauthenticated', async ({
  request,
}) => {
  const res = await request.get('http://localhost:3000/api/auth/session')
  expect(res.status()).toBe(200)
  expect(await res.json()).toBeNull()
})
