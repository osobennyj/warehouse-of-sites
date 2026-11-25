const BLOCKSCOUT_ORIGINS: Record<string, string> = {
  ethereum: "https://eth.blockscout.com",
  base: "https://base.blockscout.com",
  arbitrum: "https://arbitrum.blockscout.com",
  optimism: "https://optimism.blockscout.com",
};

export type LiveCounterparty = {
  address: string;
  label: string | null;
  direction: "in" | "out";
  tokenSymbol: string;
  value: string;
  txHash: string;
};

export type LiveExpandResult =
  | { ok: true; counterparties: LiveCounterparty[] }
  | { ok: false; error: string };

function originForChain(chain: string): string {
  return BLOCKSCOUT_ORIGINS[chain] ?? BLOCKSCOUT_ORIGINS.ethereum!;
}

export async function expandAddressLive(chain: string, address: string): Promise<LiveExpandResult> {
  const origin = originForChain(chain);
  try {
    const res = await fetch(`${origin}/api/v2/addresses/${address}/transactions`, {
      headers: { Accept: "application/json" },
    });
    if (res.status === 429) {
      return { ok: false, error: "Blockscout rate limit — try again in a minute." };
    }
    if (!res.ok) {
      return { ok: false, error: `Blockscout error (${res.status})` };
    }
    const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
  const items = body.items ?? [];
    const counterparties: LiveCounterparty[] = [];
    for (const item of items.slice(0, 12)) {
      const from = item.from as { hash?: string; name?: string | null } | undefined;
      const to = item.to as { hash?: string; name?: string | null } | undefined;
      const hash = String(item.hash ?? "");
      const value = String(item.value ?? "0");
      const fromHash = from?.hash?.toLowerCase();
      const toHash = to?.hash?.toLowerCase();
      const addrLower = address.toLowerCase();
      if (fromHash && fromHash !== addrLower) {
        counterparties.push({
          address: fromHash,
          label: from?.name ?? null,
          direction: "in",
          tokenSymbol: "ETH",
          value,
          txHash: hash,
        });
      }
      if (toHash && toHash !== addrLower) {
        counterparties.push({
          address: toHash,
          label: to?.name ?? null,
          direction: "out",
          tokenSymbol: "ETH",
          value,
          txHash: hash,
        });
      }
    }
    return { ok: true, counterparties };
  } catch {
    return { ok: false, error: "Network error talking to Blockscout." };
  }
}