from __future__ import annotations

from collections import deque
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal

import networkx as nx
import structlog

from wci.ingestion.domain import AddressInfo, GraphExpansionParams, Transfer
from wci.ingestion.protocol import ChainDataSource

logger = structlog.get_logger(__name__)


def _normalize(addr: str) -> str:
    return addr.lower()


@dataclass
class ExpandedGraph:
    graph: nx.MultiDiGraph = field(default_factory=nx.MultiDiGraph)
    addresses: dict[str, AddressInfo] = field(default_factory=dict)
    transfers: list[Transfer] = field(default_factory=list)


def _should_stop_expansion(
    address: str,
    info: AddressInfo,
    *,
    stop_at_labeled: bool,
    is_labeled: Callable[[str, AddressInfo], bool],
) -> bool:
    if not stop_at_labeled:
        return False
    return is_labeled(address, info)


def _transfer_passes_filters(
    tr: Transfer,
    *,
    min_value_wei: Decimal,
    since: datetime | None,
) -> bool:
    if tr.value < min_value_wei:
        return False
    if since is not None and tr.timestamp < since:
        return False
    return True


async def expand_graph(
    source: ChainDataSource,
    params: GraphExpansionParams,
    *,
    is_labeled: Callable[[str, AddressInfo], bool] | None = None,
    fetch_native: bool = True,
    fetch_token: bool = True,
) -> ExpandedGraph:
    """BFS expansion with depth, max-nodes, min value, and label stop-list guards."""

    labeled_fn = is_labeled or (lambda _a, _i: False)
    result = ExpandedGraph()
    g = result.graph
    seed = _normalize(params.seed)

    queue: deque[tuple[str, int]] = deque([(seed, 0)])
    seen: set[str] = {seed}

    while queue and len(seen) <= params.max_nodes:
        address, depth = queue.popleft()
        if depth > params.max_depth:
            continue

        info = await source.get_address_info(address)
        result.addresses[address] = info
        g.add_node(address, info=info)

        if _should_stop_expansion(address, info, stop_at_labeled=params.stop_at_labeled, is_labeled=labeled_fn):
            logger.info("bfs_stop_labeled", address=address, labels=info.labels)
            continue

        transfers: list[Transfer] = []
        if fetch_native:
            transfers.extend(await source.get_native_transfers(address))
        if fetch_token:
            transfers.extend(await source.get_token_transfers(address))

        counterparties: list[str] = []
        for tr in transfers:
            if not _transfer_passes_filters(tr, min_value_wei=params.min_value_wei, since=params.since):
                continue
            result.transfers.append(tr)
            g.add_edge(
                tr.from_address,
                tr.to_address,
                key=tr.tx_hash,
                transfer=tr,
            )
            other = tr.to_address if tr.from_address == address else tr.from_address
            if other != address:
                counterparties.append(other)

        unique_counterparties = list(dict.fromkeys(counterparties))[: params.max_counterparties_per_node]

        if len(seen) >= params.max_nodes:
            break
        if depth >= params.max_depth:
            continue

        for cp in unique_counterparties:
            cp_norm = _normalize(cp)
            if cp_norm in seen:
                continue
            if len(seen) >= params.max_nodes:
                break
            seen.add(cp_norm)
            queue.append((cp_norm, depth + 1))

    return result