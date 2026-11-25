from __future__ import annotations

from wci.ingestion.domain import AddressInfo
from wci.labeling.protocol import LabelSource


class LabelRegistry:
    """Merges YAML seed labels with optional Blockscout name tags on AddressInfo."""

    def __init__(self, *sources: LabelSource) -> None:
        self.sources = list(sources)

    def _seed_labels(self, address: str) -> list[str]:
        out: list[str] = []
        for src in self.sources:
            out.extend(src.get_labels(address))
        return list(dict.fromkeys(out))

    def label_for(self, address: str) -> str | None:
        labels = self._seed_labels(address)
        return labels[0] if labels else None

    def categories_for(self, address: str) -> list[str]:
        return self._seed_labels(address)

    def is_cex_hot_wallet(self, address: str) -> bool:
        lowered = [c.lower() for c in self.categories_for(address)]
        return any("cex" in c for c in lowered)

    def is_expansion_stop(self, address: str) -> bool:
        return any(src.is_stop_node(address) for src in self.sources)

    def enrich_address_info(self, info: AddressInfo) -> AddressInfo:
        labels = list(info.labels)
        labels.extend(self._seed_labels(info.address))
        if info.name_tag and info.name_tag not in labels:
            labels.append(info.name_tag)
        info.labels = list(dict.fromkeys(labels))
        return info

    def is_labeled(self, address: str, info: AddressInfo) -> bool:
        return bool(info.labels) or self.is_expansion_stop(address)