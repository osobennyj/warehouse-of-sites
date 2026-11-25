from __future__ import annotations

from dataclasses import dataclass

from wci.clustering.domain import Evidence


@dataclass(frozen=True)
class HeuristicWeights:
    common_funder: float = 0.30
    cex_deposit_reuse: float = 0.25
    synchronized_activity: float = 0.20
    sweep_pattern: float = 0.25

    def weight_for(self, rule: str) -> float:
        return getattr(self, rule, 0.1)


def score_cluster(evidence: list[Evidence], weights: HeuristicWeights) -> float:
    """Transparent weighted score: sum(confidence * weight) capped at 1.0."""

    if not evidence:
        return 0.0
    total = 0.0
    for ev in evidence:
        total += ev.confidence * weights.weight_for(ev.rule)
    return min(1.0, round(total, 4))
