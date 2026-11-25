from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import httpx
import structlog

from wci.ingestion.cache import FileResponseCache
from wci.ingestion.domain import AddressInfo, Transfer
from wci.ingestion.protocol import ChainDataSource

logger = structlog.get_logger(__name__)

CHAIN_BASE_URLS: dict[str, str] = {
    "ethereum": "https://eth.blockscout.com",
    "base": "https://base.blockscout.com",
    "arbitrum": "https://arbitrum.blockscout.com",
    "optimism": "https://optimism.blockscout.com",
}

WEI = Decimal(10) ** 18


def _parse_ts(raw: str | None) -> datetime | None:
    if not raw:
        return None
    normalized = raw.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized).astimezone(UTC)
    except ValueError:
        return None


def _decimal_value(raw: str | int | float | dict[str, object] | None) -> Decimal:
    if raw is None:
        return Decimal(0)
    if isinstance(raw, dict):
        inner = raw.get("value") or raw.get("amount")
        return _decimal_value(inner if isinstance(inner, (str, int, float)) else None)
    try:
        return Decimal(str(raw))
    except Exception:
        return Decimal(0)


class BlockscoutAdapter(ChainDataSource):
    """Async Blockscout REST API v2 client with disk cache and backoff."""

    def __init__(
        self,
        chain: str,
        *,
        cache: FileResponseCache | None = None,
        client: httpx.AsyncClient | None = None,
        max_retries: int = 3,
    ) -> None:
        if chain not in CHAIN_BASE_URLS:
            msg = f"Unsupported chain {chain!r}; choose from {sorted(CHAIN_BASE_URLS)}"
            raise ValueError(msg)
        self.chain = chain
        self.base_url = CHAIN_BASE_URLS[chain]
        self.cache = cache or FileResponseCache(Path.home() / ".cache" / "wci" / "blockscout")
        self._client = client
        self._owns_client = client is None
        self.max_retries = max_retries

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(60.0),
                headers={"accept": "application/json"},
            )
        return self._client

    async def aclose(self) -> None:
        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None

    async def _fetch_json(self, path: str) -> Any:
        cached = self.cache.get(self.chain, path)
        if cached is not None:
            return cached

        client = await self._get_client()
        delay = 0.5
        last_exc: Exception | None = None
        for attempt in range(self.max_retries):
            try:
                resp = await client.get(path)
                if resp.status_code == 429:
                    await asyncio.sleep(delay)
                    delay *= 2
                    continue
                resp.raise_for_status()
                data = resp.json()
                self.cache.set(self.chain, path, data)
                return data
            except (httpx.HTTPError, httpx.TimeoutException) as exc:
                last_exc = exc
                logger.warning("blockscout_request_failed", path=path, attempt=attempt, error=str(exc))
                await asyncio.sleep(delay)
                delay *= 2
        if last_exc:
            raise last_exc
        raise RuntimeError(f"Failed to fetch {path}")

    async def get_address_info(self, address: str) -> AddressInfo:
        addr = address.lower()
        data = await self._fetch_json(f"/api/v2/addresses/{addr}")
        name_tag = None
        if isinstance(data.get("name"), str):
            name_tag = data["name"]
        elif isinstance(meta := data.get("metadata"), dict):
            raw_name = meta.get("name")
            name_tag = raw_name if isinstance(raw_name, str) else None
        return AddressInfo(
            address=addr,
            is_contract=bool(data.get("is_contract") or data.get("is_smart_contract")),
            name_tag=name_tag if isinstance(name_tag, str) else None,
            tx_count=int(data.get("transactions_count") or data.get("transaction_count") or 0),
        )

    def _map_native_items(self, address: str, payload: dict[str, Any]) -> list[Transfer]:
        items = payload.get("items") or []
        out: list[Transfer] = []
        addr = address.lower()
        for item in items:
            tx = item.get("transaction") or item
            from_obj = item.get("from") or tx.get("from") or {}
            to_obj = item.get("to") or tx.get("to") or {}
            from_addr = from_obj.get("hash", "") if isinstance(from_obj, dict) else ""
            to_addr = to_obj.get("hash", "") if isinstance(to_obj, dict) else ""
            if not from_addr or not to_addr:
                continue
            from_addr = from_addr.lower()
            to_addr = to_addr.lower()
            if addr not in (from_addr, to_addr):
                continue
            value_raw = item.get("value") or tx.get("value") or item.get("amount") or "0"
            out.append(
                Transfer(
                    tx_hash=str(tx.get("hash") or item.get("hash") or item.get("tx_hash") or ""),
                    from_address=from_addr,
                    to_address=to_addr,
                    value=_decimal_value(value_raw),
                    token_symbol=str(item.get("coin_symbol") or "ETH"),
                    token_address=None,
                    token_kind="native",
                    timestamp=_parse_ts(item.get("timestamp") or tx.get("timestamp"))
                    or datetime.min.replace(tzinfo=UTC),
                    block_number=item.get("block_number") or tx.get("block_number"),
                )
            )
        return out

    def _map_token_items(self, address: str, payload: dict[str, Any]) -> list[Transfer]:
        items = payload.get("items") or []
        out: list[Transfer] = []
        addr = address.lower()
        for item in items:
            from_addr = (item.get("from") or {}).get("hash", "")
            to_addr = (item.get("to") or {}).get("hash", "")
            token = item.get("token") or {}
            if not from_addr or not to_addr:
                continue
            tx_hash = str((item.get("transaction") or {}).get("hash") or item.get("tx_hash") or "")
            from_l = from_addr.lower()
            to_l = to_addr.lower()
            if addr not in (from_l, to_l):
                continue
            out.append(
                Transfer(
                    tx_hash=tx_hash,
                    from_address=from_l,
                    to_address=to_l,
                    value=_decimal_value(item.get("total") or item.get("value") or "0"),
                    token_symbol=str(token.get("symbol") or "ERC20"),
                    token_address=str(token.get("address_hash") or token.get("address") or "").lower()
                    or None,
                    token_kind="erc20",
                    timestamp=_parse_ts(item.get("timestamp")) or datetime.min.replace(tzinfo=UTC),
                    block_number=item.get("block_number"),
                )
            )
        return out

    async def _collect_transfer_pages(
        self,
        addr: str,
        resource: str,
        mapper: Any,
        *,
        max_pages: int = 1,
    ) -> list[Transfer]:
        base_path = f"/api/v2/addresses/{addr}/{resource}"
        path = base_path
        combined: list[Transfer] = []
        for _ in range(max_pages):
            data = await self._fetch_json(path)
            if not isinstance(data, dict):
                break
            combined.extend(mapper(addr, data))
            next_params = data.get("next_page_params")
            if not next_params or not isinstance(next_params, dict):
                break
            path = f"{base_path}?{urlencode({k: str(v) for k, v in next_params.items()})}"
        return combined

    async def get_native_transfers(self, address: str, *, max_pages: int = 1) -> list[Transfer]:
        addr = address.lower()
        return await self._collect_transfer_pages(
            addr,
            "transactions",
            self._map_native_items,
            max_pages=max_pages,
        )

    async def get_token_transfers(self, address: str, *, max_pages: int = 1) -> list[Transfer]:
        addr = address.lower()
        return await self._collect_transfer_pages(
            addr,
            "token-transfers",
            self._map_token_items,
            max_pages=max_pages,
        )
