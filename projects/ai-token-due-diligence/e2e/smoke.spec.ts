import { test, expect } from "@playwright/test";

test("home loads and gallery link works", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ticker in");
  await page.getByRole("navigation").getByRole("link", { name: "Gallery" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Report gallery");
});

test("sample report opens", async ({ page }) => {
  await page.goto("reports/arbitrum/");
  await expect(page.locator("h1")).toContainText("Arbitrum");
});