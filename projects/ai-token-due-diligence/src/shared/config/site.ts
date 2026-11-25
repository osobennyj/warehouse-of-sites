export const siteConfig = {
  name: "AI Token Due Diligence",
  tagline: "Ticker in → sourced research memo out",
  description:
    "An LLM-assisted agent that gathers CoinGecko, DefiLlama, vesting, holder and news data, then produces a structured token due-diligence report with hallucination checks.",
  repoUrl: "https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/ai-token-due-diligence",
  githubPagesPath: "/warehouse-of-sites/projects/ai-token-due-diligence",
  sampleTokens: ["arbitrum", "ethena", "aave", "uniswap", "pendle"] as const,
};

export function appBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

export function withBasePath(href: string): string {
  const base = appBasePath().replace(/\/$/, "");
  if (!base) return href;
  return href.startsWith("/") ? `${base}${href}` : `${base}/${href}`;
}