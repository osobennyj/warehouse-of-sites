from __future__ import annotations

from typing import Protocol, runtime_checkable


@runtime_checkable
class LabelSource(Protocol):
    """Provides static or API-backed address labels."""

    def get_labels(self, address: str) -> list[str]: ...

    def is_stop_node(self, address: str) -> bool: ...


@runtime_checkable
class MutableLabelRegistry(Protocol):
    """Merged label view used during graph expansion and reporting."""

    def label_for(self, address: str) -> str | None: ...

    def categories_for(self, address: str) -> list[str]: ...

    def is_cex_hot_wallet(self, address: str) -> bool: ...

    def is_expansion_stop(self, address: str) -> bool: ...