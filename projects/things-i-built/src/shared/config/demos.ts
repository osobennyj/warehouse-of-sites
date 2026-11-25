import { siteConfig } from "./site";

const DEMO_SLUGS = [
  "funding-rate-radar",
  "wallet-cluster-investigator",
  "defi-strategist-mcp",
  "ai-token-due-diligence",
] as const;

export type DemoSlug = (typeof DEMO_SLUGS)[number];

export function isDemoSlug(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug);
}

/** Stable hosted MVP path on GitHub Pages (served under site base). */
export function projectDemoPath(slug: DemoSlug): string {
  return `/demos/${slug}/`;
}

export function projectDemoUrl(slug: DemoSlug): string {
  return `${siteConfig.url}${projectDemoPath(slug)}`;
}