from __future__ import annotations

from pathlib import Path

from wci.clustering.scoring import HeuristicWeights

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LABELS_PATH = PACKAGE_ROOT / "labels" / "seed.yaml"
DEFAULT_CACHE_DIR = Path.home() / ".cache" / "wci" / "blockscout"


def default_weights() -> HeuristicWeights:
    return HeuristicWeights()


def weights_as_dict(weights: HeuristicWeights) -> dict[str, float]:
    return {
        "common_funder": weights.common_funder,
        "cex_deposit_reuse": weights.cex_deposit_reuse,
        "synchronized_activity": weights.synchronized_activity,
        "sweep_pattern": weights.sweep_pattern,
    }
