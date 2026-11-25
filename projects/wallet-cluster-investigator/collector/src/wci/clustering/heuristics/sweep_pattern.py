from __future__ import annotations

from collections import defaultdict
from decimal import Decimal

from wci.clustering.domain import Evidence, HeuristicContext


class SweepPatternHeuristic:
    """Many wallets sending most of their balance to one collector address."""

    name = "sweep_pattern"

    def analyze(self, ctx: HeuristicContext) -> list[Evidence]:
        incoming: dict[str, Decimal] = defaultdict(lambda: Decimal(0))
        outgoing: dict[str, Decimal] = defaultdict(lambda: Decimal(0))
        sweep_txs: dict[tuple[str, str], list[str]] = defaultdict(list)

        for tr in ctx.transfers:
            if tr.token_kind != "native":
                continue
            outgoing[tr.from_address] += tr.value
            incoming[tr.to_address] += tr.value
            sweep_txs[(tr.from_address, tr.to_address)].append(tr.tx_hash)

        collector_wallets: dict[str, list[tuple[str, str]]] = defaultdict(list)
        ratio = Decimal(str(ctx.sweep_ratio))
        for wallet in ctx.addresses:
            if wallet in ctx.cex_hot_wallets:
                continue
            out_total = outgoing[wallet]
            if out_total <= 0:
                continue
            for dest, amount in (
                (tr.to_address, tr.value) for tr in ctx.transfers if tr.from_address == wallet
            ):
                if dest in ctx.cex_hot_wallets or dest == wallet:
                    continue
                share = amount / out_total
                if share >= ratio:
                    tx_list = sweep_txs.get((wallet, dest), [])
                    if tx_list:
                        collector_wallets[dest].append((wallet, tx_list[0]))

        out: list[Evidence] = []
        for collector, members in collector_wallets.items():
            if len(members) < 2:
                continue
            wallets = tuple(m[0] for m in members)
            txs = tuple(m[1] for m in members)
            out.append(
                Evidence(
                    rule=self.name,
                    addresses=wallets,
                    confidence=min(0.92, 0.55 + 0.06 * len(wallets)),
                    tx_hashes=txs,
                    detail=f"Swept to collector {collector}",
                )
            )
        return out
