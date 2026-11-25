from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any


class FileResponseCache:
    """Deterministic on-disk cache for raw API JSON payloads."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def _key_path(self, namespace: str, key: str) -> Path:
        digest = hashlib.sha256(f"{namespace}:{key}".encode()).hexdigest()
        return self.root / namespace / f"{digest}.json"

    def get(self, namespace: str, key: str) -> Any | None:
        path = self._key_path(namespace, key)
        if not path.exists():
            return None
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)

    def set(self, namespace: str, key: str, payload: Any) -> None:
        path = self._key_path(namespace, key)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fh:
            json.dump(payload, fh, sort_keys=True, separators=(",", ":"))