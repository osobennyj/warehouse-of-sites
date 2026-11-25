from __future__ import annotations

import json
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path

import pytest

from wci.ingestion.domain import Transfer

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "blockscout"


def load_fixture(name: str) -> object:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture
def sample_transfer() -> Transfer:
    return Transfer(
        tx_hash="0xabc",
        from_address="0xa",
        to_address="0xb",
        value=Decimal("1e18"),
        token_symbol="ETH",
        token_address=None,
        token_kind="native",
        timestamp=datetime(2024, 6, 1, 12, 0, tzinfo=UTC),
    )
