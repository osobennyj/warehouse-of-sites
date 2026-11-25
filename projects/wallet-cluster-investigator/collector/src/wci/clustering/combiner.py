from __future__ import annotations

import uuid

from wci.clustering.domain import Cluster, Evidence, HeuristicContext
from wci.clustering.heuristics.protocol import Heuristic
from wci.clustering.scoring import HeuristicWeights, score_cluster
from wci.clustering.union_find import UnionFind


def combine_evidence(
    evidence_items: list[Evidence],
    *,
    weights: HeuristicWeights | None = None,
    min_members: int = 2,
) -> list[Cluster]:
    weights = weights or HeuristicWeights()
    uf = UnionFind()
    ev_by_root: dict[str, list[Evidence]] = {}

    for ev in evidence_items:
        if len(ev.addresses) < 2:
            continue
        addrs = list(ev.addresses)
        root_addr = addrs[0]
        for addr in addrs:
            uf.union(root_addr, addr)
        component_root = uf.find(root_addr)
        ev_by_root.setdefault(component_root, []).append(ev)

    clusters: list[Cluster] = []
    for members in uf.components().values():
        if len(members) < min_members:
            continue
        root = uf.find(members[0])
        evs = ev_by_root.get(root, [])
        clusters.append(
            Cluster(
                cluster_id=str(uuid.uuid4()),
                members=sorted(members),
                score=score_cluster(evs, weights),
                evidence=evs,
            )
        )
    clusters.sort(key=lambda c: c.score, reverse=True)
    return clusters


def run_heuristics(heuristics: list[Heuristic], ctx: HeuristicContext) -> list[Evidence]:
    out: list[Evidence] = []
    for h in heuristics:
        out.extend(h.analyze(ctx))
    return out
