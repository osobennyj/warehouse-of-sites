from __future__ import annotations

from wci.reporting.schema import Investigation

EXPLORER_BASE: dict[str, str] = {
    "ethereum": "https://eth.blockscout.com/address/",
    "base": "https://base.blockscout.com/address/",
    "arbitrum": "https://arbitrum.blockscout.com/address/",
    "optimism": "https://optimism.blockscout.com/address/",
}


def _explorer_link(chain: str, address: str) -> str:
    base = EXPLORER_BASE.get(chain, EXPLORER_BASE["ethereum"])
    return f"{base}{address}"


def render_markdown_report(inv: Investigation) -> str:
    lines: list[str] = []
    meta = inv.metadata
    lines.append("# Wallet Cluster Investigation Report")
    lines.append("")
    lines.append("## Executive summary")
    lines.append(
        f"Seed `{meta.seed_address}` on **{meta.chain}** — "
        f"{len(inv.nodes)} nodes, {len(inv.edges)} aggregated edges, "
        f"{len(inv.clusters)} clusters (generated {meta.generated_at.isoformat()})."
    )
    lines.append("")

    lines.append("## Top clusters")
    for cluster in sorted(inv.clusters, key=lambda c: c.score, reverse=True)[:10]:
        lines.append(f"### Cluster `{cluster.cluster_id}` (score {cluster.score:.3f})")
        lines.append(f"Members ({len(cluster.members)}): " + ", ".join(f"`{m}`" for m in cluster.members))
        for ev in cluster.evidence:
            lines.append(f"- **{ev.rule}** (confidence {ev.confidence:.2f}): {ev.detail}")
            if ev.tx_hashes:
                lines.append(f"  - txs: {', '.join(ev.tx_hashes[:5])}")
        lines.append("")

    lines.append("## Explorer links (seed)")
    lines.append(f"- [{meta.seed_address}]({_explorer_link(meta.chain, meta.seed_address)})")
    lines.append("")

    lines.append("## Methodology")
    lines.append(
        "Heuristics: common funder, CEX deposit reuse, synchronized activity, sweep pattern. "
        "Evidence is merged with union-find; cluster score is a weighted sum of rule confidences."
    )
    lines.append("")

    lines.append("## Limitations")
    lines.append(
        "- Public indexer data only; incomplete history may miss links.\n"
        "- Heuristic matches are probabilistic — shared infrastructure (CEX, bridges) causes false positives.\n"
        "- Attribution is analytical signal, not proof of ownership."
    )
    lines.append("")
    return "\n".join(lines)