import { useState } from "react";
import { Link } from "react-router-dom";
import { expandAddressLive, type LiveCounterparty } from "@/shared/api/blockscout";
import { cn } from "@/shared/lib/cn";
import { shortenAddress } from "@/entities/investigation";

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function AnalyzeWalletView() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counterparties, setCounterparties] = useState<LiveCounterparty[]>([]);

  async function runAnalysis() {
    if (!ETH_ADDRESS.test(address.trim())) {
      setError("Enter a valid 0x address (42 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    setCounterparties([]);
    const result = await expandAddressLive(chain, address.trim());
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCounterparties(result.counterparties);
  }

  const funders = counterparties.filter((c) => c.direction === "in");
  const outbound = counterparties.filter((c) => c.direction === "out");
  const labeledCex = counterparties.filter((c) => c.label && /exchange|binance|okx|bybit|coinbase/i.test(c.label));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <Link to="/" className="text-sm text-accent hover:underline">
          ← Gallery
        </Link>
        <h1 className="text-3xl font-semibold text-white">Paste a wallet (public data)</h1>
        <p className="text-sm leading-relaxed text-slate-400">
          This demo is <strong className="text-amber-200">not a finished product</strong>. It does not call the Arkham
          API or ship Arkham labels. It only queries <strong className="text-slate-200">Blockscout</strong> from your
          browser (one hop of native transfers). Use the committed investigations for the full clustering heuristics.
        </p>
      </header>

      <div className="space-y-3 rounded-xl border border-surface-border bg-surface-raised p-5">
        <label className="block text-sm text-slate-400">
          EVM address
          <input
            className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-2 font-mono text-sm"
            placeholder="0x…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label className="block text-sm text-slate-400">
          Chain
          <select
            className="mt-1 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            <option value="ethereum">Ethereum</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
          </select>
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runAnalysis()}
          className={cn(
            "rounded-md bg-accent/25 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/35",
            loading && "opacity-60",
          )}
        >
          {loading ? "Querying Blockscout…" : "Run public-data preview"}
        </button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>

      {counterparties.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">Trading-relevant hints (Blockscout evidence)</h2>
          <EvidenceCards chain={chain} funders={funders} labeledCex={labeledCex} />
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>
              <strong className="text-slate-100">Inbound funders:</strong> {funders.length} counterparties sent native
              value in the sample slice.
              {funders[0] ? ` Example: ${shortenAddress(funders[0].address)}.` : " None in sample."}
            </li>
            <li>
              <strong className="text-slate-100">Outbound:</strong> {outbound.length} destinations in the sample.
            </li>
            <li>
              <strong className="text-slate-100">Named labels in API:</strong>{" "}
              {labeledCex.length > 0
                ? `${labeledCex.length} hits with exchange-like names (not Arkham, may be incomplete).`
                : "None in this Blockscout response. Do not infer CEX deposit reuse without full clustering."}
            </li>
          </ul>
          <p className="text-xs text-slate-500">
            What you cannot claim: identity, intent, insider status, or PnL. Attribution stays probabilistic. For evidence
            panels and heuristics, open a saved investigation from the gallery.
          </p>
          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="min-w-full text-left text-xs text-slate-400">
              <thead>
                <tr className="border-b border-surface-border text-slate-500">
                  <th className="p-2">Counterparty</th>
                  <th className="p-2">Dir</th>
                  <th className="p-2">Label</th>
                </tr>
              </thead>
              <tbody>
                {counterparties.slice(0, 12).map((c) => (
                  <tr key={`${c.txHash}-${c.address}`} className="border-b border-surface-border/60">
                    <td className="p-2 font-mono text-slate-200">{shortenAddress(c.address)}</td>
                    <td className="p-2">{c.direction}</td>
                    <td className="p-2">{c.label ?? "none"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function blockscoutTxUrl(chain: string, txHash: string): string {
  const origins: Record<string, string> = {
    ethereum: "https://eth.blockscout.com",
    base: "https://base.blockscout.com",
    arbitrum: "https://arbitrum.blockscout.com",
    optimism: "https://optimism.blockscout.com",
  };
  const origin = origins[chain] ?? origins.ethereum;
  return `${origin}/tx/${txHash}`;
}

function EvidenceCards({
  chain,
  funders,
  labeledCex,
}: {
  chain: string;
  funders: LiveCounterparty[];
  labeledCex: LiveCounterparty[];
}) {
  const topFunder = funders[0];
  const topCex = labeledCex[0];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-lg border border-surface-border bg-surface-raised p-4">
        <h3 className="text-sm font-medium text-white">Where funds came from</h3>
        {topFunder ? (
          <>
            <p className="mt-2 font-mono text-sm text-accent">{shortenAddress(topFunder.address)}</p>
            <p className="mt-1 text-xs text-slate-500">
              Inbound native transfer in sample · value {topFunder.value} {topFunder.tokenSymbol}
              {topFunder.label ? ` · label: ${topFunder.label}` : ""}
            </p>
            <a
              href={blockscoutTxUrl(chain, topFunder.txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-sky-400 hover:underline"
            >
              Tx evidence {shortenAddress(topFunder.txHash)}
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No inbound native transfers in this Blockscout slice.</p>
        )}
      </article>
      <article className="rounded-lg border border-surface-border bg-surface-raised p-4">
        <h3 className="text-sm font-medium text-white">CEX / named touchpoint</h3>
        {topCex ? (
          <>
            <p className="mt-2 font-mono text-sm text-accent">{shortenAddress(topCex.address)}</p>
            <p className="mt-1 text-xs text-slate-500">
              API label: {topCex.label} · {topCex.direction} · not Arkham, may be incomplete
            </p>
            <a
              href={blockscoutTxUrl(chain, topCex.txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-sky-400 hover:underline"
            >
              Tx evidence {shortenAddress(topCex.txHash)}
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No exchange-like names in this response. Do not infer shared CEX deposits without full clustering.
          </p>
        )}
      </article>
    </div>
  );
}