from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from wci.clustering.domain import Evidence, HeuristicContext


def _activity_signature(ctx: HeuristicContext, address: str) -> tuple[datetime, tuple[str, ...]]:
    contract_calls: list[str] = []
    first_ts: datetime | None = None
    for tr in sorted(ctx.transfers, key=lambda t: t.timestamp):
        if tr.from_address != address and tr.to_address != address:
            continue
        if first_ts is None:
            first_ts = tr.timestamp
        counterpart = tr.to_address if tr.from_address == address else tr.from_address
        if tr.token_kind == "erc20" or tr.token_address:
            contract_calls.append(f"token:{counterpart}")
        else:
            contract_calls.append(f"native:{counterpart}")
    return (first_ts or datetime.min, tuple(contract_calls[:10]))


class SynchronizedActivityHeuristic:
    """Near-identical first activity time and contract interaction sequence."""

    name = "synchronized_activity"

    def __init__(self, window_seconds: int | None = None) -> None:
        self.window_seconds = window_seconds

    def analyze(self, ctx: HeuristicContext) -> list[Evidence]:
        window = self.window_seconds if self.window_seconds is not None else ctx.sync_window_seconds
        sigs: dict[str, tuple[datetime, tuple[str, ...]]] = {
            addr: _activity_signature(ctx, addr) for addr in ctx.addresses if addr not in ctx.cex_hot_wallets
        }

        buckets: dict[tuple[str, ...], list[str]] = defaultdict(list)
        times: dict[str, datetime] = {}
        for addr, (first_ts, seq) in sigs.items():
            buckets[seq].append(addr)
            times[addr] = first_ts

        out: list[Evidence] = []
        for seq, addrs in buckets.items():
            if len(addrs) < 2 or not seq:
                continue
            addrs_sorted = sorted(addrs, key=lambda a: times[a])
            anchor = times[addrs_sorted[0]]
            cluster_addrs = [a for a in addrs_sorted if abs((times[a] - anchor).total_seconds()) <= window]
            if len(cluster_addrs) < 2:
                continue
            out.append(
                Evidence(
                    rule=self.name,
                    addresses=tuple(cluster_addrs),
                    confidence=min(0.85, 0.4 + 0.07 * len(cluster_addrs)),
                    tx_hashes=(),
                    detail=f"Matching activity sequence within {window}s window",
                )
            )
        return out
