import type { Analysis, Facts, Score, TokenRef } from "@/entities/report";

/**
 * Deterministic narrative for tests, CI, and the keyless GitHub Pages demo.
 * Prose avoids numeric literals so the hallucination guard stays strict on live LLM output.
 */
export function createMockAnalysis(
  token: TokenRef,
  facts: Facts,
  score: Score,
): Analysis {
  const m = facts.market;
  const p = facts.protocol;
  const u = facts.unlocks;
  const h = facts.holders;
  const marketSid = m?.sourceId ?? facts.news[0]?.sourceId ?? "S1";
  const protocolSid = p?.sourceId ?? marketSid;
  const unlockSid = u?.sourceId ?? marketSid;
  const holderSid = h?.sourceId ?? marketSid;

  const summary = [
    `${token.name} (${token.symbol}) receives grade ${score.grade} on our transparent checklist (see score breakdown).`,
    m
      ? "Market metrics are sourced from CoinGecko (price, capitalization, volume, momentum)."
      : "Market data was unavailable.",
    p ? `DefiLlama tracks ${p.name} protocol activity across its deployed chains.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tokenomics = u
    ? "Vesting model highlights upcoming unlock categories; see unlock table and the sourced vesting documentation."
    : "Float versus fully diluted valuation is the primary dilution lens when no vesting file exists.";

  const fundamentals = p
    ? `${p.name} (${p.category ?? "DeFi"}) — review TVL trend, fee generation and revenue yield in the metrics panel.`
    : "No matching protocol TVL/revenue footprint — treat as pure token/market exposure.";

  const distribution = h
    ? `On ${h.chain}, review top-holder concentration in the holder tool output (contracts and exchanges included).`
    : "Holder concentration data not available for this token on supported chains.";

  const catalysts = facts.news.slice(0, 2).map((n) => ({
    title: n.title.slice(0, 80),
    detail: `Recent coverage from ${n.outlet}.`,
    sourceIds: [n.sourceId],
  }));

  const risks = [
    m && (m.priceChange30dPct ?? 0) < -10
      ? {
          title: "Weak recent momentum",
          detail: "Recent price trend is negative in market data.",
          severity: "medium" as const,
          sourceIds: [marketSid],
        }
      : null,
    u && u.windows.some((w) => w.days === 365 && (w.pctOfCirculating ?? 0) > 10)
      ? {
          title: "Unlock overhang",
          detail: "Vesting model shows meaningful supply events ahead.",
          severity: "high" as const,
          sourceIds: [unlockSid],
        }
      : null,
    h && h.top10SharePct > 50
      ? {
          title: "Concentrated supply",
          detail: "Top holders control a majority of on-chain supply.",
          severity: "medium" as const,
          sourceIds: [holderSid],
        }
      : null,
  ].filter((r): r is NonNullable<typeof r> => Boolean(r));

  const redFlags =
    score.grade === "D" || score.grade === "F"
      ? [
          {
            title: "Low composite score",
            detail: "Multiple checklist factors scored below average.",
            sourceIds: [marketSid, protocolSid],
          },
        ]
      : [];

  const verdict = `Grade ${score.grade} — ${token.symbol} ${
    score.grade === "A" || score.grade === "B"
      ? "shows relatively balanced fundamentals versus identified risks"
      : "carries elevated supply, liquidity or concentration risk"
  }; verify sources before sizing a position.`;

  return {
    summary,
    tokenomics,
    fundamentals,
    distribution,
    catalysts,
    risks,
    redFlags,
    verdict,
  };
}