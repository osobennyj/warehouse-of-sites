import type { Report } from "./schema";
import { formatPct, formatSignedPct, formatUsd } from "@/shared/lib/format";

export function reportToMarkdown(report: Report): string {
  const { token, facts, analysis, score, sources } = report;
  const lines: string[] = [
    `# ${token.name} (${token.symbol}) — due diligence`,
    ``,
    `> ${analysis.verdict}`,
    ``,
    `**Score:** ${score.total}/100 (${score.grade}) · data coverage ${score.coveragePct}%`,
    ``,
    `## Summary`,
    analysis.summary,
    ``,
    `## Market snapshot`,
    marketTable(facts),
    ``,
    `## Tokenomics`,
    analysis.tokenomics,
    facts.unlocks?.notes ? `\n_${facts.unlocks.notes}_\n` : "",
    ``,
    `## Protocol fundamentals`,
    analysis.fundamentals,
    protocolTable(facts),
    ``,
    `## On-chain distribution`,
    analysis.distribution,
    ``,
    `## Catalysts`,
    ...bulletSection(analysis.catalysts),
    ``,
    `## Risks`,
    ...analysis.risks.map(
      (r) => `- **${r.title}** (${r.severity}): ${r.detail} ${cite(r.sourceIds)}`,
    ),
    ``,
    `## Red flags`,
    ...bulletSection(analysis.redFlags),
    ``,
    `## Score breakdown`,
    ...score.factors.map(
      (f) =>
        `- **${f.label}** (${f.weight}): ${f.score ?? "n/a"} — ${f.rationale}`,
    ),
    ``,
    `## Sources`,
    ...sources.map((s) => `- [${s.title}](${s.url}) (${s.tool}, ${s.id})`),
    ``,
    `_Not financial advice. Generated ${report.createdAt}._`,
  ];
  return lines.filter(Boolean).join("\n");
}

function marketTable(facts: Report["facts"]): string {
  const m = facts.market;
  if (!m) return "_No market data._";
  return [
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Price | ${formatUsd(m.priceUsd)} |`,
    `| Market cap | ${formatUsd(m.marketCapUsd)} |`,
    `| FDV | ${formatUsd(m.fdvUsd)} |`,
    `| 24h volume | ${formatUsd(m.volume24hUsd)} |`,
    `| MC/FDV | ${formatPct(m.mcapToFdvPct)} |`,
    `| Vol/MCap | ${formatPct(m.volumeToMcapPct)} |`,
    `| 30d | ${formatSignedPct(m.priceChange30dPct)} |`,
  ].join("\n");
}

function protocolTable(facts: Report["facts"]): string {
  const p = facts.protocol;
  if (!p) return "_No matching DeFi protocol on DefiLlama._";
  return [
    `| Metric | Value |`,
    `| --- | --- |`,
    `| TVL | ${formatUsd(p.tvlUsd)} |`,
    `| TVL 30d | ${formatSignedPct(p.tvlChange30dPct)} |`,
    `| Fees 30d | ${formatUsd(p.fees?.last30dUsd)} |`,
    `| Revenue 365d | ${formatUsd(p.revenue?.last365dUsd)} |`,
    `| Rev yield | ${formatPct(p.revenueYieldPct)} |`,
    `| Chains | ${p.chains.slice(0, 5).join(", ") || "n/a"} |`,
  ].join("\n");
}

function bulletSection(points: { title: string; detail: string; sourceIds: string[] }[]) {
  if (!points.length) return ["_None identified._"];
  return points.map((p) => `- **${p.title}**: ${p.detail} ${cite(p.sourceIds)}`);
}

function cite(ids: string[]) {
  return ids.length ? `(sources: ${ids.join(", ")})` : "";
}