from __future__ import annotations

from typing import Protocol, runtime_checkable

from wci.ingestion.domain import AddressInfo, Transfer


@runtime_checkable
class ChainDataSource(Protocol):
    """Abstraction over chain indexers (Blockscout, etc.)."""

    async def get_address_info(self, address: str) -> AddressInfo:
        """Fetch address metadata and optional name tags."""

    async def get_native_transfers(self, address: str, *, page: int = 1) -> list[Transfer]:
        """List native coin transfers involving `address`."""

    async def get_token_transfers(self, address: str, *, page: int = 1) -> list[Transfer]:
        """List ERC-20 token transfers involving `address`."""