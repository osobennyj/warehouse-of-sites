import { test, expect } from '@playwright/test';

test('playground home loads and runs find yields', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'DeFi Strategist MCP' })).toBeVisible();
  await expect(page.getByText('Risk-adjusted DefiLlama pool ranking')).toBeVisible();
  await page.getByRole('button', { name: 'Run tool' }).click();
  await expect(page.locator('pre')).toContainText(/pools|error/i, { timeout: 60_000 });
});

test('agent transcripts tab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Agent transcripts' }).click();
  await expect(page.getByText('Stablecoin ladder')).toBeVisible();
});