import { z } from "zod";
import type { TokenRef } from "@/entities/report";
import { HttpError, type HttpClient } from "../http/http-client";
import type { PeriodTotalsSnapshot, ProtocolDataSource, ProtocolSnapshot } from "../types";

const ProtocolSchema = z.object({
  name: z.string(),
  gecko_id: z.string().nullable().optional(),
  symbol: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  chains: z.array(z.string()).optional(),
  currentChainTvls: z.record(z.string(), z.number()).optional(),
  tvl: z.array(z.object({ date: z.number(), totalLiquidityUSD: z.number() })).nullable().optional(),
});
type Protocol = z.infer<typeof ProtocolSchema>;

const SummarySchema = z.object({
  total24h: z.number().nullable().optional(),
  total30d: z.number().nullable().optional(),
  total1y: z.number().nullable().optional(),
});

/** Keys in `currentChainTvls` that are breakdowns, not chains. */
const NON_CHAIN_KEYS = new Set(["borrowed", "staking", "pool2", "vesting", "treasury", "offers"]);
const DAY_SECONDS = 86_400;

export function createDefiLlama({
  http,
  baseUrl = "https://api.llama.fi",
}: {
  http: HttpClient;
  baseUrl?: string;
}): ProtocolDataSource {
  const fetchOrNull = async <T>(load: () => Promise<T>): Promise<T | null> => {
    try {
      return await load();
    } catch (error) {
      if (error instanceof HttpError && error.status >= 400 && error.status < 500) return null;
      throw error;
    }
  };

  const summary = async (slug: string, dataType: "dailyFees" | "dailyRevenue") => {
    const url = `${baseUrl}/summary/fees/${slug}?dataType=${dataType}&excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`;
    const data = await fetchOrNull(() => http.getJson(url, SummarySchema));
    return data ? toPeriodTotals(data) : null;
  };

  return {
    async getProtocolMetrics(token) {
      for (const slug of slugCandidates(token)) {
        const protocol = await fetchOrNull(() =>
          http.getJson(`${baseUrl}/protocol/${slug}`, ProtocolSchema),
        );
        if (!protocol || !matchesToken(protocol, token)) continue;
        const [fees, revenue] = await Promise.all([
          summary(slug, "dailyFees"),
          summary(slug, "dailyRevenue"),
        ]);
        return toSnapshot(protocol, slug, fees, revenue);
      }
      return null;
    },
  };
}

export function slugCandidates(token: TokenRef): string[] {
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const base = [token.id, slugify(token.name)];
  const stripped = base.map((slug) => slug.replace(/-(dao|finance|protocol|token|network)$/, ""));
  return [...new Set([...base, ...stripped])];
}

const matchesToken = (protocol: Protocol, token: TokenRef) =>
  protocol.gecko_id === token.id ||
  (protocol.gecko_id == null && protocol.symbol?.toUpperCase() === token.symbol);

function toSnapshot(
  protocol: Protocol,
  slug: string,
  fees: PeriodTotalsSnapshot | null,
  revenue: PeriodTotalsSnapshot | null,
): ProtocolSnapshot {
  const series = protocol.tvl ?? [];
  const latest = series.at(-1);
  const monthAgo = latest
    ? series.findLast((point) => point.date <= latest.date - 30 * DAY_SECONDS)
    : undefined;
  const chainsFromTvl = Object.keys(protocol.currentChainTvls ?? {}).filter(
    (key) => !key.includes("-") && !NON_CHAIN_KEYS.has(key),
  );
  return {
    sourceUrl: `https://defillama.com/protocol/${slug}`,
    name: protocol.name,
    category: protocol.category ?? null,
    chains: protocol.chains?.length ? protocol.chains : chainsFromTvl,
    tvlUsd: latest && latest.totalLiquidityUSD > 0 ? latest.totalLiquidityUSD : null,
    tvl30dAgoUsd: monthAgo && monthAgo.totalLiquidityUSD > 0 ? monthAgo.totalLiquidityUSD : null,
    fees,
    revenue,
  };
}

function toPeriodTotals(data: z.infer<typeof SummarySchema>): PeriodTotalsSnapshot | null {
  const totals = {
    last24hUsd: data.total24h ?? null,
    last30dUsd: data.total30d ?? null,
    last365dUsd: data.total1y ?? null,
  };
  return Object.values(totals).every((v) => v === null) ? null : totals;
}
