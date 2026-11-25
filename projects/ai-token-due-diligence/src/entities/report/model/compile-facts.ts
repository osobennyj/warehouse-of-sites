import type { TokenRef } from "./schema";
import type { Facts, NewsItem, Source, ToolName } from "./schema";
import type {
  HolderSnapshot,
  MarketSnapshot,
  ProtocolSnapshot,
  VestingSchedule,
} from "@/server/data-sources/types";
import type { NewsArticle } from "@/server/data-sources/types";
import { expandSchedule, summarizeUnlocks } from "@/server/data-sources/unlocks/vesting-engine";

export interface ResearchBundle {
  market: MarketSnapshot | null;
  protocol: ProtocolSnapshot | null;
  unlockSchedule: VestingSchedule | null;
  holders: HolderSnapshot | null;
  news: NewsArticle[];
}

export function compileFacts(
  token: TokenRef,
  bundle: ResearchBundle,
  now = new Date(),
): { facts: Facts; sources: Source[] } {
  const sources: Source[] = [];
  let seq = 1;
  const add = (tool: ToolName, title: string, url: string): string => {
    const id = `S${seq++}`;
    sources.push({ id, tool, title, url, fetchedAt: now.toISOString() });
    return id;
  };

  const market = bundle.market
    ? {
        sourceId: add("getMarketData", `CoinGecko — ${token.symbol}`, bundle.market.sourceUrl),
        priceUsd: bundle.market.priceUsd,
        marketCapUsd: bundle.market.marketCapUsd,
        fdvUsd: bundle.market.fdvUsd,
        volume24hUsd: bundle.market.volume24hUsd,
        marketCapRank: bundle.market.marketCapRank,
        circulatingSupply: bundle.market.circulatingSupply,
        totalSupply: bundle.market.totalSupply,
        maxSupply: bundle.market.maxSupply,
        athUsd: bundle.market.athUsd,
        athChangePct: bundle.market.athChangePct,
        priceChange24hPct: bundle.market.priceChange24hPct,
        priceChange30dPct: bundle.market.priceChange30dPct,
        priceChange1yPct: bundle.market.priceChange1yPct,
        mcapToFdvPct: ratioPct(bundle.market.marketCapUsd, bundle.market.fdvUsd),
        volumeToMcapPct: ratioPct(bundle.market.volume24hUsd, bundle.market.marketCapUsd),
      }
    : null;

  const protocol = bundle.protocol
    ? {
        sourceId: add(
          "getProtocolMetrics",
          `DefiLlama — ${bundle.protocol.name}`,
          bundle.protocol.sourceUrl,
        ),
        name: bundle.protocol.name,
        category: bundle.protocol.category,
        chains: bundle.protocol.chains,
        tvlUsd: bundle.protocol.tvlUsd,
        tvlChange30dPct: pctChange(bundle.protocol.tvlUsd, bundle.protocol.tvl30dAgoUsd),
        fees: bundle.protocol.fees,
        revenue: bundle.protocol.revenue,
        revenueYieldPct:
          bundle.protocol.revenue?.last365dUsd != null && bundle.market?.marketCapUsd
            ? ratioPct(bundle.protocol.revenue.last365dUsd, bundle.market.marketCapUsd)
            : null,
        priceToRevenue:
          bundle.protocol.revenue?.last365dUsd != null &&
          bundle.market?.marketCapUsd &&
          bundle.protocol.revenue.last365dUsd > 0
            ? bundle.market.marketCapUsd / bundle.protocol.revenue.last365dUsd
            : null,
      }
    : null;

  let unlocks = null;
  if (bundle.unlockSchedule) {
    const sourceId = add(
      "getTokenUnlocks",
      bundle.unlockSchedule.sourceTitle,
      bundle.unlockSchedule.sourceUrl,
    );
    const events = expandSchedule(bundle.unlockSchedule);
    const summary = summarizeUnlocks(events, now);
    const price = bundle.market?.priceUsd ?? null;
    const circ = bundle.market?.circulatingSupply ?? null;
    unlocks = {
      sourceId,
      windows: summary.windows.map((w) => ({
        days: w.days,
        tokens: w.tokens,
        usd: price != null ? w.tokens * price : null,
        pctOfCirculating: circ && circ > 0 ? (w.tokens / circ) * 100 : null,
      })),
      upcoming: summary.upcoming.map((u) => ({
        date: u.date,
        category: u.category,
        tokens: u.tokens,
        usd: price != null ? u.tokens * price : null,
      })),
      remainingLockedTokens: summary.remainingLockedTokens,
      scheduleEndsOn: summary.scheduleEndsOn,
      notes: bundle.unlockSchedule.notes,
    };
  }

  let holders = null;
  if (bundle.holders?.holders.length) {
    const top = bundle.holders.holders;
    holders = {
      sourceId: add(
        "getHolderConcentration",
        `Top holders — ${bundle.holders.chain}`,
        bundle.holders.sourceUrl,
      ),
      chain: bundle.holders.chain,
      contract: bundle.holders.contract,
      top1SharePct: top[0]?.sharePct ?? 0,
      top10SharePct: top.slice(0, 10).reduce((s, h) => s + h.sharePct, 0),
      holders: top.map((h) => ({ address: h.address, sharePct: h.sharePct })),
    };
  }

  const news: NewsItem[] = bundle.news.map((article) => ({
    sourceId: add("getRecentNews", article.outlet, article.url),
    title: article.title,
    url: article.url,
    outlet: article.outlet,
    publishedAt: article.publishedAt,
  }));

  return {
    facts: { market, protocol, unlocks, holders, news },
    sources,
  };
}

function ratioPct(numerator: number | null | undefined, denominator: number | null | undefined) {
  if (numerator == null || denominator == null || denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function pctChange(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}