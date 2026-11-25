import type { Analysis, Facts, GuardResult } from "./schema";
import { collectAllowedNumbers, verifyAnalysisNumbers } from "./allowed-numbers";

export function runHallucinationGuard(analysis: Analysis, facts: Facts): GuardResult {
  const allowed = collectAllowedNumbers(facts);
  const texts = [
    analysis.summary,
    analysis.tokenomics,
    analysis.fundamentals,
    analysis.distribution,
    analysis.verdict,
    ...analysis.catalysts.map((c) => `${c.title} ${c.detail}`),
    ...analysis.risks.map((r) => `${r.title} ${r.detail}`),
    ...analysis.redFlags.map((r) => `${r.title} ${r.detail}`),
  ];
  const { passed, unverified } = verifyAnalysisNumbers(texts, allowed);
  const invalidCitations = findInvalidCitations(analysis, facts);
  return {
    passed: passed && invalidCitations.length === 0,
    unverifiedNumbers: unverified,
    invalidCitations,
    repairAttempts: 0,
  };
}

function findInvalidCitations(analysis: Analysis, facts: Facts): string[] {
  const valid = new Set(
  [
    facts.market?.sourceId,
    facts.protocol?.sourceId,
    facts.unlocks?.sourceId,
    facts.holders?.sourceId,
    ...facts.news.map((n) => n.sourceId),
  ].filter(Boolean),
  );
  const invalid = new Set<string>();
  for (const section of [analysis.catalysts, analysis.risks, analysis.redFlags]) {
    for (const point of section) {
      for (const id of point.sourceIds) {
        if (!valid.has(id)) invalid.add(id);
      }
    }
  }
  return [...invalid];
}