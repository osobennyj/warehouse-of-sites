from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime
from decimal import Decimal

from wci.clustering.domain import Cluster
from wci.ingestion.domain import Transfer
from wci.ingestion.expand_graph import ExpandedGraph
from wci.labeling.registry import LabelRegistry
from wci.reporting.schema import (
    ClusterRecord,
    EvidenceRecord,
    Investigation,
    InvestigationEdge,
    InvestigationMetadata,
    InvestigationNode,
)


def _aggregate_edges(transfers: list[Transfer]) -> list[InvestigationEdge]:
    buckets: dict[tuple[str, str, str, str | None], list[Transfer]] = defaultdict(list)
    for tr in transfers:
        key = (tr.from_address, tr.to_address, tr.token_symbol, tr.token_address)
        buckets[key].append(tr)

    edges: list[InvestigationEdge] = []
    for (from_a, to_a, symbol, token_addr), items in buckets.items():
        total = sum((i.value for i in items), Decimal(0))
        times = [i.timestamp for i in items]
        edges.append(
            InvestigationEdge(
                from_address=from_a,
                to_address=to_a,
                token_symbol=symbol,
                token_address=token_addr,
                total_value=str(total),
                transfer_count=len(items),
                first_timestamp=min(times),
                last_timestamp=max(times),
            )
        )
    return edges


def build_investigation(
    expanded: ExpandedGraph,
    clusters: list[Cluster],
    *,
    chain: str,
    seed: str,
    data_source: str,
    parameters: dict[str, object],
    weights: dict[str, float],
    labels: LabelRegistry,
) -> Investigation:
    nodes: list[InvestigationNode] = []
    first_seen: dict[str, datetime] = {}
    for tr in expanded.transfers:
        for addr in (tr.from_address, tr.to_address):
            prev = first_seen.get(addr)
            if prev is None or tr.timestamp < prev:
                first_seen[addr] = tr.timestamp

    for addr, info in expanded.addresses.items():
        info = labels.enrich_address_info(info)
        nodes.append(
            InvestigationNode(
                address=addr,
                label=labels.label_for(addr),
                first_seen=first_seen.get(addr) or info.first_seen,
                tx_count=info.tx_count,
                categories=labels.categories_for(addr),
            )
        )

    cluster_records = [
        ClusterRecord(
            cluster_id=c.cluster_id,
            members=c.members,
            score=c.score,
            evidence=[
                EvidenceRecord(
                    rule=e.rule,
                    addresses=list(e.addresses),
                    confidence=e.confidence,
                    tx_hashes=list(e.tx_hashes),
                    detail=e.detail,
                )
                for e in c.evidence
            ],
        )
        for c in clusters
    ]

    meta = InvestigationMetadata(
        chain=chain,
        seed_address=seed.lower(),
        data_source=data_source,
        generated_at=datetime.now(tz=UTC),
        parameters=parameters,
        heuristic_weights=weights,
    )
    return Investigation(
        metadata=meta,
        nodes=nodes,
        edges=_aggregate_edges(expanded.transfers),
        clusters=cluster_records,
    )
