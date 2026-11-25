from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal

from wci.clustering.domain import HeuristicContext
from wci.clustering.heuristics.cex_deposit_reuse import CexDepositReuseHeuristic
from wci.clustering.heuristics.common_funder import CommonFunderHeuristic
from wci.clustering.heuristics.sweep_pattern import SweepPatternHeuristic
from wci.clustering.heuristics.synchronized_activity import SynchronizedActivityHeuristic
from wci.ingestion.domain import Transfer

TS = datetime(2024, 6, 1, 12, 0, tzinfo=UTC)
CEX = "0xbinance"


def _native(
    tx: str,
    fr: str,
    to: str,
    value: str = "1000000000000000000",
    ts: datetime | None = None,
) -> Transfer:
    return Transfer(
        tx_hash=tx,
        from_address=fr.lower(),
        to_address=to.lower(),
        value=Decimal(value),
        token_symbol="ETH",
        token_address=None,
        token_kind="native",
        timestamp=ts or TS,
    )


def test_common_funder_positive() -> None:
    w1, w2, funder = "0xw1", "0xw2", "0xfunder"
    ctx = HeuristicContext(
        transfers=[
            _native("0x1", funder, w1),
            _native("0x2", funder, w2),
        ],
        addresses={w1, w2, funder},
        cex_hot_wallets={CEX},
    )
    evidence = CommonFunderHeuristic().analyze(ctx)
    assert len(evidence) == 1
    assert set(evidence[0].addresses) == {w1, w2}


def test_common_funder_negative_cex_funder() -> None:
    w1, w2 = "0xw1", "0xw2"
    ctx = HeuristicContext(
        transfers=[
            _native("0x1", CEX, w1),
            _native("0x2", CEX, w2),
        ],
        addresses={w1, w2},
        cex_hot_wallets={CEX},
    )
    assert CommonFunderHeuristic().analyze(ctx) == []


def test_cex_deposit_reuse() -> None:
    w1, w2, hop = "0xw1", "0xw2", "0xhop"
    ctx = HeuristicContext(
        transfers=[
            _native("0x1", w1, hop),
            _native("0x2", w2, hop),
            _native("0x3", hop, CEX),
        ],
        addresses={w1, w2},
        cex_hot_wallets={CEX},
    )
    evidence = CexDepositReuseHeuristic().analyze(ctx)
    assert len(evidence) == 1
    assert set(evidence[0].addresses) == {w1, w2}


def test_synchronized_activity() -> None:
    w1, w2, dest = "0xw1", "0xw2", "0xdest"
    t0 = TS
    ctx = HeuristicContext(
        transfers=[
            _native("0x1", w1, dest, ts=t0),
            _native("0x2", w2, dest, ts=t0 + timedelta(minutes=5)),
        ],
        addresses={w1, w2},
        cex_hot_wallets=set(),
        sync_window_seconds=3600,
    )
    evidence = SynchronizedActivityHeuristic().analyze(ctx)
    assert len(evidence) >= 1


def test_sweep_pattern() -> None:
    w1, w2, collector = "0xw1", "0xw2", "0xcol"
    ctx = HeuristicContext(
        transfers=[
            _native("0x1", w1, collector, "900000000000000000"),
            _native("0x1b", w1, "0xnoise", "100000000000000000"),
            _native("0x2", w2, collector, "1800000000000000000"),
            _native("0x2b", w2, "0xnoise", "200000000000000000"),
        ],
        addresses={w1, w2, collector},
        cex_hot_wallets=set(),
        sweep_ratio=0.85,
    )
    evidence = SweepPatternHeuristic().analyze(ctx)
    assert len(evidence) == 1
    assert set(evidence[0].addresses) == {w1, w2}
