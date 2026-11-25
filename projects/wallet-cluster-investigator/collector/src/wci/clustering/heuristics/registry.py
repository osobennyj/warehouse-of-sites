from __future__ import annotations

from wci.clustering.heuristics.cex_deposit_reuse import CexDepositReuseHeuristic
from wci.clustering.heuristics.common_funder import CommonFunderHeuristic
from wci.clustering.heuristics.protocol import Heuristic
from wci.clustering.heuristics.synchronized_activity import SynchronizedActivityHeuristic
from wci.clustering.heuristics.sweep_pattern import SweepPatternHeuristic


def default_heuristics() -> list[Heuristic]:
    return [
        CommonFunderHeuristic(),
        CexDepositReuseHeuristic(),
        SynchronizedActivityHeuristic(),
        SweepPatternHeuristic(),
    ]