import type { ReactNode } from "react";
import { shortenAddress, type ClusterRecord } from "@/entities/investigation";

type Props = {
  clusters: ClusterRecord[];
  onSelectMember: (address: string) => void;
};

export function ClusterTable({ clusters, onSelectMember }: Props) {
  if (clusters.length === 0) {
    return <p className="text-sm text-slate-500">No clusters detected for current filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="bg-surface-raised text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Cluster</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Rules</th>
            <th className="px-3 py-2">Members</th>
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster) => (
            <tr key={cluster.cluster_id} className="border-t border-surface-border">
              <td className="px-3 py-2 font-mono">{cluster.cluster_id}</td>
              <td className="px-3 py-2">{cluster.score.toFixed(2)}</td>
              <td className="px-3 py-2 text-xs text-slate-400">
                {cluster.evidence.map((e) => e.rule).join(", ")}
              </td>
              <td className="px-3 py-2">
                <MemberChips members={cluster.members} onSelect={onSelectMember} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberChips({ members, onSelect }: { members: string[]; onSelect: (a: string) => void }) {
  return (
    <FlexWrap>
      {members.slice(0, 5).map((m) => (
        <button
          type="button"
          key={m}
          className="mr-1 rounded bg-surface px-2 py-0.5 font-mono text-xs text-accent hover:bg-surface-border"
          onClick={() => onSelect(m)}
        >
          {shortenAddress(m)}
        </button>
      ))}
      {members.length > 5 ? <span className="text-xs text-slate-500">+{members.length - 5}</span> : null}
    </FlexWrap>
  );
}

function FlexWrap({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1">{children}</div>;
}