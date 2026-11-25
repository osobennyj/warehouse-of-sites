from __future__ import annotations

import json
from pathlib import Path

import httpx
import pytest
import respx

from wci.ingestion.blockscout import BlockscoutAdapter
from wci.ingestion.cache import FileResponseCache

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "blockscout"
SEED = "0xseed000000000000000000000000000000000001"
CP = "0xseed000000000000000000000000000000000002"


def _load(name: str) -> object:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.mark.asyncio
@respx.mock
async def test_blockscout_adapter_uses_cache_and_parses_transfers(tmp_path: Path) -> None:
    cache = FileResponseCache(tmp_path)
    client = httpx.AsyncClient(base_url="https://eth.blockscout.com")
    adapter = BlockscoutAdapter("ethereum", cache=cache, client=client)

    respx.get(f"/api/v2/addresses/{SEED}").respond(200, json=_load("address_info.json"))
    respx.get(f"/api/v2/addresses/{CP}").respond(200, json=_load("counterparty.json"))
    respx.get(f"/api/v2/addresses/{SEED}/transactions").respond(
        200,
        json=_load("native_transactions_page1.json"),
    )
    respx.get(f"/api/v2/addresses/{SEED}/token-transfers").respond(
        200,
        json=_load("token_transfers_page1.json"),
    )

    info = await adapter.get_address_info(SEED)
    assert info.tx_count == 42

    native = await adapter.get_native_transfers(SEED)
    assert len(native) == 2
    assert native[0].from_address == "0xfunder00000000000000000000000000000001"

    token = await adapter.get_token_transfers(SEED)
    assert len(token) == 1
    assert token[0].token_symbol == "USDC"

    cached = cache.get("ethereum", f"/api/v2/addresses/{SEED}")
    assert cached is not None

    await adapter.aclose()
