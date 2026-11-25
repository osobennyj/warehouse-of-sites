from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal

import pytest

from wci.ingestion.domain import AddressInfo, GraphExpansionParams, Transfer
from wci.ingestion.expand_graph import expand_graph

SEED = "0xseed000000000000000000000000000000000001"
CP = "0xseed000000000000000000000000000000000002"
LABELED = "0x28c6c06298d5141aec6c2c94d5a2e2b8c2e4c11"
FUNDER = "0xfunder00000000000000000000000000000001"


class FakeSource:
    def __init__(self) -> None:
        self.calls: list[str] = []

    async def get_address_info(self, address: str) -> AddressInfo:
        self.calls.append(address)
        labels: list[str] = []
        if address == LABELED:
            labels = ["Binance 14"]
        return AddressInfo(address=address, labels=labels, tx_count=1)

    async def get_native_transfers(self, address: str, *, page: int = 1) -> list[Transfer]:
        ts = datetime(2024, 6, 1, 12, 0, tzinfo=UTC)
        if address == SEED:
            return [
                Transfer(
                    tx_hash="0x1",
                    from_address=FUNDER,
                    to_address=SEED,
                    value=Decimal(10**18),
                    token_symbol="ETH",
                    token_address=None,
                    token_kind="native",
                    timestamp=ts,
                ),
                Transfer(
                    tx_hash="0x2",
                    from_address=SEED,
                    to_address=CP,
                    value=Decimal(10**17),
                    token_symbol="ETH",
                    token_address=None,
                    token_kind="native",
                    timestamp=ts,
                ),
                Transfer(
                    tx_hash="0x3",
                    from_address=SEED,
                    to_address=LABELED,
                    value=Decimal(10**18),
                    token_symbol="ETH",
                    token_address=None,
                    token_kind="native",
                    timestamp=ts,
                ),
            ]
        if address == CP:
            return []
        return []

    async def get_token_transfers(self, address: str, *, page: int = 1) -> list[Transfer]:
        return []


@pytest.mark.asyncio
async def test_bfs_respects_max_nodes_and_depth() -> None:
    source = FakeSource()
    params = GraphExpansionParams(
        seed=SEED,
        max_depth=1,
        max_nodes=2,
        min_value_wei=Decimal(0),
        since=None,
        max_counterparties_per_node=10,
    )
    expanded = await expand_graph(source, params)
    assert len(expanded.addresses) <= 2


@pytest.mark.asyncio
async def test_bfs_stops_at_labeled_addresses() -> None:
    source = FakeSource()

    def is_labeled(address: str, info: AddressInfo) -> bool:
        return bool(info.labels)

    params = GraphExpansionParams(
        seed=SEED,
        max_depth=2,
        max_nodes=10,
        min_value_wei=Decimal(0),
        since=None,
    )
    expanded = await expand_graph(source, params, is_labeled=is_labeled)
    assert LABELED in expanded.addresses
    # Labeled node is discovered but not expanded past metadata fetch
    assert source.calls.count(LABELED) == 1
