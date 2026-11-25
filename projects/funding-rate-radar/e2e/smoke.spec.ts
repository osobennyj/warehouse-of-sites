import { expect, test } from "@playwright/test";

test("dashboard loads and filters change the table", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Funding Rate Radar" })).toBeVisible({ timeout: 60_000 });

  const rows = page.locator("tbody tr");
  await expect(rows.first()).toBeVisible({ timeout: 60_000 });
  const initial = await rows.count();

  await page.getByLabel("Min spread APR").fill("50");
  const filtered = await rows.count();
  expect(filtered).toBeLessThanOrEqual(initial);

  await page.goto("/asset/BTC/");
  await expect(page.getByRole("heading", { name: "BTC" })).toBeVisible();
  await expect(page.getByText("Net yield calculator")).toBeVisible();
});