import { test, expect } from '@playwright/test'

test('leaderboard page lists players', async ({ page }) => {
  await page.goto('http://localhost:3000/leaderboard')
  await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Wins' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Losses' })).toBeVisible()
  await expect(page.getByRole('row').nth(1)).toBeVisible()
})
