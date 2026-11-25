from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class InvestigationNode(BaseModel):
    address: str
    label: str | None = None
    first_seen: datetime | None = None
    tx_count: int = 0
    categories: list[str] = Field(default_factory=list)


class InvestigationEdge(BaseModel):
    from_address: str
    to_address: str
    token_symbol: str
    token_address: str | None = None
    total_value: str
    transfer_count: int
    first_timestamp: datetime | None = None
    last_timestamp: datetime | None = None


class EvidenceRecord(BaseModel):
    rule: str
    addresses: list[str]
    confidence: float
    tx_hashes: list[str] = Field(default_factory=list)
    detail: str = ""


class ClusterRecord(BaseModel):
    cluster_id: str
    members: list[str]
    score: float
    evidence: list[EvidenceRecord] = Field(default_factory=list)


class InvestigationMetadata(BaseModel):
    schema_version: str = "1.0.0"
    chain: str
    seed_address: str
    data_source: str
    generated_at: datetime
    parameters: dict[str, Any] = Field(default_factory=dict)
    heuristic_weights: dict[str, float] = Field(default_factory=dict)


class Investigation(BaseModel):
    """Versioned investigation document (v1)."""

    metadata: InvestigationMetadata
    nodes: list[InvestigationNode]
    edges: list[InvestigationEdge]
    clusters: list[ClusterRecord]


def export_json_schema() -> dict[str, Any]:
    return Investigation.model_json_schema()
