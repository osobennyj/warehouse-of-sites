from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


class YamlLabelSource:
    """Loads seed labels from YAML (CEX hot wallets, bridges, routers)."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._entries: dict[str, dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        raw = yaml.safe_load(self.path.read_text(encoding="utf-8")) or {}
        entries = raw.get("addresses") or []
        for entry in entries:
            addr = str(entry.get("address", "")).lower()
            if not addr:
                continue
            self._entries[addr] = entry

    def get_labels(self, address: str) -> list[str]:
        entry = self._entries.get(address.lower())
        if not entry:
            return []
        label = entry.get("label")
        category = entry.get("category")
        out: list[str] = []
        if isinstance(label, str):
            out.append(label)
        if isinstance(category, str):
            out.append(category)
        return out

    def is_stop_node(self, address: str) -> bool:
        entry = self._entries.get(address.lower())
        if not entry:
            return False
        return bool(entry.get("stop_expansion", False))

    def entry_for(self, address: str) -> dict[str, Any] | None:
        return self._entries.get(address.lower())

    def cex_hot_wallet_addresses(self) -> set[str]:
        out: set[str] = set()
        for addr, entry in self._entries.items():
            category = str(entry.get("category", "")).lower()
            if "cex" in category:
                out.add(addr)
        return out