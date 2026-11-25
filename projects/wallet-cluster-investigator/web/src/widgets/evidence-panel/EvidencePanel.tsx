import { shortenAddress, type ClusterRecord, type InvestigationNode } from "@/entities/investigation";
import { explorerAddressUrl } from "@/shared/config/site";

type Props = {
  chain: string;
  node: InvestigationNode | null;
  cluster: ClusterRecord | null;
};

export function EvidencePanel({ chain, node, cluster }: Props) {
  if (!node) {
    return (
      <div className="rounded-lg border border-dashed border-surface-border p-6 text-sm text-slate-400">
        Select a node in the graph to inspect labels, cluster membership, and evidence.
      </div>
    );
  }

  return (
    <form className="space-y-4 rounded-lg border border-surface-border bg-surface-raised p-4 text-sm" onSubmit={(e) => e.preventDefault()}>
      <a
        href={explorerAddressUrl(chain, node.address)}
        className="font-mono text-accent hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        {node.address}
      </a>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-300">
        <dt className="text-slate-500">Label</dt>
        <dd>{node.label ?? "—"}</dd>
        <dt className="text-slate-500">Tx count</dt>
        <dd>{node.tx_count}</dd>
        <dt className="text-slate-500">First seen</dt>
        <dd>{node.first_seen ? String(node.first_seen) : "—"}</dd>
      </dl>
      {cluster ? (
        <section className="space-y-2 border-t border-surface-border pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cluster {cluster.cluster_id}</h3>
          <p className="text-slate-300">Score: {cluster.score.toFixed(2)}</p>
          <ul className="space-y-2">
            {cluster.evidence.map((evidence) => (
              <li key={`${evidence.rule}-${evidence.detail}`} className="rounded border border-surface-border bg-surface p-2">
                <div className="font-medium text-accent">{evidence.rule}</div>
                <div className="text-xs text-slate-400">confidence {evidence.confidence.toFixed(2)}</div>
                <p className="mt-1 text-slate-300">{evidence.detail}</p>
                {evidence.tx_hashes.length > 0 ? (
                  <p className="mt-1 font-mono text-[10px] text-slate-500">{evidence.tx_hashes.slice(0, 3).join(", ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Members: {cluster.members.map(shortenAddress).join(", ")}</p>
        </section>
      ) : (
        <p className="text-slate-500">No cluster assignment for this address.</p>
      )}
    </form>
  );
}