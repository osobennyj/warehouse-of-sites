from __future__ import annotations

from collections import defaultdict
from decimal import Decimal

from wci.clustering.domain import Evidence, HeuristicContext
from wci.clustering.heuristics.protocol import Heuristic


class CommonFunderHeuristic:
    """Wallets whose first incoming native transfer came from the same non-CEX address."""

    name = "common_funder"

    def analyze(self, ctx: HeuristicContext) -> list[Evidence]:
        first_incoming: dict[str, tuple[str, str]] = {}
        for tr in sorted(ctx.transfers, key=lambda t: t.timestamp):
            if tr.token_kind != "native":
                continue
            wallet = tr.to_address
            if wallet not in ctx.addresses:
                continue
            if wallet in first_incoming:
                continue
            if tr.from_address in ctx.cex_hot_wallets:
                continue
            first_incoming[wallet] = (tr.from_address, tr.tx_hash)

        by_funder: dict[str, list[tuple[str, str]]] = defaultdict(list)
        for wallet, (funder, tx_hash) in first_incoming.items():
            if funder in ctx.cex_hot_wallets:
                continue
            by_funder[funder].append((wallet, tx_hash))

        out: list[Evidence] = []
        for funder, members in by_funder.items():
            if len(members) < 2:
                continue
            wallets = tuple(m[0] for m in members)
            txs = tuple(m[1] for m in members)
            confidence = min(0.95, 0.5 + 0.1 * len(members))
            out.append(
                Evidence(
                    rule=self.name,
                    addresses=wallets,
                    confidence=confidence,
                    tx_hashes=txs,
                    detail=f"Shared first funder {funder}",
                )
            )
        return out