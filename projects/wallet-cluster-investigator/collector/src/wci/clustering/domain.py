from __future__ import annotations

from dataclasses import dataclass, field

from wci.ingestion.domain import Transfer


@dataclass(frozen=True, slots=True)
class Evidence:
    rule: str
    addresses: tuple[str, ...]
    confidence: float
    tx_hashes: tuple[str, ...] = field(default_factory=tuple)
    detail: str = ""


@dataclass
class Cluster:
    cluster_id: str
    members: list[str]
    score: float
    evidence: list[Evidence] = field(default_factory=list)


@dataclass
class HeuristicContext:
    """Inputs shared by all heuristics."""

    transfers: list[Transfer]
    addresses: set[str]
    cex_hot_wallets: set[str]
    sync_window_seconds: int = 3600
    sweep_ratio: float = 0.85
