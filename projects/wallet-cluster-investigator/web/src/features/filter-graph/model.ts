import type { Investigation, InvestigationEdge } from "@/entities/investigation";

export type GraphFilters = {
  minTransferCount: number;
  heuristic: string | "all";
  since: string | null;
};

export const defaultGraphFilters: GraphFilters = {
  minTransferCount: 1,
  heuristic: "all",
  since: null,
};

export function filterEdges(edges: InvestigationEdge[], filters: GraphFilters): InvestigationEdge[] {
  return edges.filter((edge) => {
    if (edge.transfer_count < filters.minTransferCount) {
      return false;
    }
    if (filters.since && edge.last_timestamp) {
      return String(edge.last_timestamp) >= filters.since;
    }
    return true;
  });
}

export function filterInvestigationByClusterHeuristic(
  investigation: Investigation,
  heuristic: string,
): Investigation {
  if (heuristic === "all") {
    return investigation;
  }
  const memberSet = new Set<string>();
  for (const cluster of investigation.clusters) {
    const hasRule = cluster.evidence.some((e) => e.rule === heuristic);
    if (hasRule) {
      for (const m of cluster.members) {
        memberSet.add(m.toLowerCase());
      }
    }
  }
  if (memberSet.size === 0) {
    return investigation;
  }
  const nodes = investigation.nodes.filter((n) => memberSet.has(n.address.toLowerCase()));
  const nodeSet = new Set(nodes.map((n) => n.address.toLowerCase()));
  const edges = investigation.edges.filter(
    (e) => nodeSet.has(e.from_address.toLowerCase()) && nodeSet.has(e.to_address.toLowerCase()),
  );
  const clusters = investigation.clusters.filter((c) => c.evidence.some((e) => e.rule === heuristic));
  return { ...investigation, nodes, edges, clusters };
}