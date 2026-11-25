import { test, expect } from "@playwright/test";

test("home loads and gallery opens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ticker in");
  await page.goto("/gallery/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Report gallery");
});

test("sample report opens", async ({ page }) => {
  await page.goto("/reports/arbitrum/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Arbitrum");
});