import { useState } from "react";
import { expandAddressLive } from "@/shared/api/blockscout";
import { cn } from "@/shared/lib/cn";

type Props = {
  chain: string;
  address: string;
  onEdges: (counterparty: string) => void;
};

export function LiveExpandButton({ chain, address, onEdges }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExpand() {
    setLoading(true);
    setStatus(null);
    const result = await expandAddressLive(chain, address);
    setLoading(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    const unique = new Set<string>();
    for (const c of result.counterparties) {
      if (!unique.has(c.address)) {
        unique.add(c.address);
        onEdges(c.address);
      }
    }
    setStatus(`Added ${unique.size} live counterparties (1-hop, native txs).`);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleExpand()}
        className={cn(
          "rounded-md border border-accent/40 px-3 py-1.5 text-sm text-accent hover:bg-accent/10",
          loading && "opacity-60",
        )}
      >
        {loading ? "Querying Blockscout…" : "Live expand (+1 hop)"}
      </button>
      {status ? <p className="text-xs text-slate-400">{status}</p> : null}
    </div>
  );
}