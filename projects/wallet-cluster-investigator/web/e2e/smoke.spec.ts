import { expect, test } from "@playwright/test";

test("gallery -> investigation shows evidence after node selection", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Wallet Cluster Investigator" })).toBeVisible();
  await page.getByRole("link", { name: "Open investigation" }).first().click();
  await expect(page.getByRole("heading", { name: "Clusters" })).toBeVisible();
  const member = page.locator("table button").first();
  await member.click();
  await expect(page.locator("dl").filter({ hasText: "Tx count" })).toBeVisible();
});