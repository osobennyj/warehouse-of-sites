from wci.clustering.domain import Evidence
from wci.clustering.scoring import HeuristicWeights, score_cluster


def test_weighted_score_caps_at_one() -> None:
    ev = [
        Evidence(rule="common_funder", addresses=("a", "b"), confidence=1.0),
        Evidence(rule="cex_deposit_reuse", addresses=("a", "b"), confidence=1.0),
        Evidence(rule="synchronized_activity", addresses=("a", "b"), confidence=1.0),
        Evidence(rule="sweep_pattern", addresses=("a", "b"), confidence=1.0),
    ]
    score = score_cluster(ev, HeuristicWeights())
    assert score == 1.0
