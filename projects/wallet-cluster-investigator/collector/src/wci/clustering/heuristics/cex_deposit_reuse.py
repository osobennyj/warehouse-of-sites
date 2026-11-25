from __future__ import annotations

from collections import defaultdict

from wci.clustering.domain import Evidence, HeuristicContext


class CexDepositReuseHeuristic:
    """Wallets sending to the same intermediate that forwards to a CEX hot wallet."""

    name = "cex_deposit_reuse"

    def analyze(self, ctx: HeuristicContext) -> list[Evidence]:
        outgoing: dict[str, set[str]] = defaultdict(set)
        incoming: dict[str, set[str]] = defaultdict(set)
        tx_by_pair: dict[tuple[str, str], str] = {}

        for tr in ctx.transfers:
            outgoing[tr.from_address].add(tr.to_address)
            incoming[tr.to_address].add(tr.from_address)
            tx_by_pair[(tr.from_address, tr.to_address)] = tr.tx_hash

        intermediate_to_senders: dict[str, set[str]] = defaultdict(set)
        for wallet in ctx.addresses:
            if wallet in ctx.cex_hot_wallets:
                continue
            for dest in outgoing.get(wallet, ()):
                if dest in ctx.cex_hot_wallets:
                    continue
                if dest in ctx.addresses:
                    continue
                for fwd in outgoing.get(dest, ()):
                    if fwd in ctx.cex_hot_wallets:
                        intermediate_to_senders[dest].add(wallet)

        out: list[Evidence] = []
        for intermediate, senders in intermediate_to_senders.items():
            if len(senders) < 2:
                continue
            txs: list[str] = []
            for w in senders:
                h = tx_by_pair.get((w, intermediate))
                if h:
                    txs.append(h)
            out.append(
                Evidence(
                    rule=self.name,
                    addresses=tuple(sorted(senders)),
                    confidence=min(0.9, 0.45 + 0.08 * len(senders)),
                    tx_hashes=tuple(txs),
                    detail=f"Shared deposit path via {intermediate} -> CEX",
                )
            )
        return out