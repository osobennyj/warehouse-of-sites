from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

import structlog

from wci.clustering.combiner import combine_evidence, run_heuristics
from wci.clustering.domain import HeuristicContext
from wci.clustering.heuristics import default_heuristics
from wci.clustering.scoring import HeuristicWeights
from wci.config import DEFAULT_CACHE_DIR, DEFAULT_LABELS_PATH, default_weights, weights_as_dict
from wci.ingestion.blockscout import BlockscoutAdapter
from wci.ingestion.cache import FileResponseCache
from wci.ingestion.domain import GraphExpansionParams
from wci.ingestion.expand_graph import expand_graph
from wci.labeling.registry import LabelRegistry
from wci.labeling.yaml_labels import YamlLabelSource
from wci.reporting.builder import build_investigation
from wci.reporting.markdown import render_markdown_report

structlog.configure(processors=[structlog.processors.JSONRenderer()])
logger = structlog.get_logger(__name__)


def _parse_since(value: str | None) -> datetime | None:
    if not value:
        return None
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


async def run_investigation(
    address: str,
    *,
    chain: str,
    depth: int,
    max_nodes: int,
    since: str | None,
    min_value_eth: float,
    out: Path,
    labels_path: Path | None = None,
    cache_dir: Path | None = None,
    weights: HeuristicWeights | None = None,
) -> Path:
    labels_path = labels_path or DEFAULT_LABELS_PATH
    cache_dir = cache_dir or DEFAULT_CACHE_DIR
    weights = weights or default_weights()

    yaml_labels = YamlLabelSource(labels_path)
    registry = LabelRegistry(yaml_labels)

    cex_hot = yaml_labels.cex_hot_wallet_addresses()

    adapter = BlockscoutAdapter(
        chain,
        cache=FileResponseCache(cache_dir),
    )

    params = GraphExpansionParams(
        seed=address,
        max_depth=depth,
        max_nodes=max_nodes,
        min_value_wei=Decimal(str(min_value_eth)) * Decimal(10) ** 18,
        since=_parse_since(since),
        max_counterparties_per_node=8,
        stop_at_labeled=True,
    )

    try:
        expanded = await expand_graph(
            adapter,
            params,
            is_labeled=lambda a, info: registry.is_labeled(a, registry.enrich_address_info(info)),
        )
    finally:
        await adapter.aclose()

    for addr, info in list(expanded.addresses.items()):
        expanded.addresses[addr] = registry.enrich_address_info(info)

    ctx = HeuristicContext(
        transfers=expanded.transfers,
        addresses=set(expanded.addresses),
        cex_hot_wallets=cex_hot,
    )
    evidence = run_heuristics(default_heuristics(), ctx)
    clusters = combine_evidence(evidence, weights=weights)

    parameters: dict[str, object] = {
        "depth": depth,
        "max_nodes": max_nodes,
        "since": since,
        "min_value_eth": min_value_eth,
    }

    investigation = build_investigation(
        expanded,
        clusters,
        chain=chain,
        seed=address,
        data_source="blockscout",
        parameters=parameters,
        weights=weights_as_dict(weights),
        labels=registry,
    )

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(investigation.model_dump_json(indent=2), encoding="utf-8")
    md_path = out.with_suffix(".md")
    md_path.write_text(render_markdown_report(investigation), encoding="utf-8")
    logger.info("investigation_written", json=str(out), markdown=str(md_path))
    return out
