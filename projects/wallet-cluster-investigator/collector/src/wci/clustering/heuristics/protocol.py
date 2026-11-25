from __future__ import annotations

from typing import Protocol, runtime_checkable

from wci.clustering.domain import Evidence, HeuristicContext


@runtime_checkable
class Heuristic(Protocol):
    name: str

    def analyze(self, ctx: HeuristicContext) -> list[Evidence]: ...
