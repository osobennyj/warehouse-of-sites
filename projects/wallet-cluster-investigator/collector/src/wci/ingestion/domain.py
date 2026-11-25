from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Literal

TokenKind = Literal["native", "erc20"]


@dataclass(frozen=True, slots=True)
class Transfer:
    """A single on-chain transfer edge."""

    tx_hash: str
    from_address: str
    to_address: str
    value: Decimal
    token_symbol: str
    token_address: str | None
    token_kind: TokenKind
    timestamp: datetime
    block_number: int | None = None


@dataclass
class AddressInfo:
    """Metadata for an address node."""

    address: str
    is_contract: bool = False
    name_tag: str | None = None
    tx_count: int = 0
    first_seen: datetime | None = None
    labels: list[str] = field(default_factory=list)


@dataclass
class GraphExpansionParams:
    seed: str
    max_depth: int
    max_nodes: int
    min_value_wei: Decimal
    since: datetime | None
    max_counterparties_per_node: int = 50
    stop_at_labeled: bool = True