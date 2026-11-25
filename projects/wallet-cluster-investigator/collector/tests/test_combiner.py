from wci.clustering.combiner import combine_evidence
from wci.clustering.domain import Evidence


def test_combiner_unions_overlapping_evidence() -> None:
    ev = [
        Evidence(rule="common_funder", addresses=("a", "b"), confidence=0.8),
        Evidence(rule="sweep_pattern", addresses=("b", "c"), confidence=0.7),
    ]
    clusters = combine_evidence(ev)
    assert len(clusters) == 1
    assert set(clusters[0].members) == {"a", "b", "c"}
    assert clusters[0].score > 0
