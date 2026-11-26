import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(root, "../public/projects");

const demos = [
  {
    slug: "funding-rate-radar",
    url: "https://osobennyj.github.io/warehouse-of-sites/demos/funding-rate-radar/",
    waitFor: "text=Funding Rate Radar",
  },
  {
    slug: "wallet-cluster-investigator",
    url: "https://osobennyj.github.io/warehouse-of-sites/demos/wallet-cluster-investigator/",
    waitFor: "text=Things I Built",
  },
  {
    slug: "ai-token-due-diligence",
    url: "https://osobennyj.github.io/warehouse-of-sites/demos/ai-token-due-diligence/",
    waitFor: "text=Things I Built",
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

for (const demo of demos) {
  await page.goto(demo.url, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(2500);
  try {
    await page.getByText("Things I Built", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  } catch {
  }

  const outDir = path.join(publicDir, demo.slug);
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "cover.png");
  await page.screenshot({ path: outPath, type: "png" });
  console.log(`Wrote ${outPath}`);
}

await browser.close();