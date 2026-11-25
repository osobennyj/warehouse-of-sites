import { expect, test } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

test.describe("portfolio smoke", () => {
  test("home renders hero and projects", async ({ page }) => {
    await page.goto(`${basePath}/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/working tools/i);
    await expect(page.getByRole("link", { name: /Funding Rate Radar/i }).first()).toBeVisible();
  });

  test("project filter keeps list visible", async ({ page }) => {
    await page.goto(`${basePath}/projects/`);
    await expect(page.getByTestId("projects-list")).toBeVisible();
    const ai = page.getByRole("button", { name: /^AI\b/i });
    if (await ai.isVisible()) {
      await ai.click();
      await expect(page.getByTestId("projects-list")).toBeVisible();
    }
  });

  test("case study opens", async ({ page }) => {
    await page.goto(`${basePath}/projects/funding-rate-radar/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Funding Rate Radar");
    await expect(page.getByRole("heading", { name: "Problem" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open demo/i })).toBeVisible();
  });

  test("CV is reachable", async ({ request }) => {
    const res = await request.get(`${basePath}/cv.pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });
});