import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  INVESTIGATION_MANIFEST,
  loadInvestigation,
  memberClusterMap,
  type Investigation,
  type InvestigationNode,
} from "@/entities/investigation";
import { defaultGraphFilters, filterEdges, filterInvestigationByClusterHeuristic } from "@/features/filter-graph/model";
import { GraphFiltersPanel } from "@/features/filter-graph/ui/GraphFiltersPanel";
import { downloadTextFile } from "@/features/download-investigation/lib";
import { LiveExpandButton } from "@/features/live-expand/ui/LiveExpandButton";
import { ClusterGraph } from "@/widgets/cluster-graph/ClusterGraph";
import { ClusterTable } from "@/widgets/cluster-table/ClusterTable";
import { EvidencePanel } from "@/widgets/evidence-panel/EvidencePanel";
import { InvestigationHeader } from "@/widgets/investigation-header/InvestigationHeader";

export function InvestigationView() {
  const { slug = "" } = useParams();
  const manifest = INVESTIGATION_MANIFEST.find((i) => i.slug === slug);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(defaultGraphFilters);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [extraNodes, setExtraNodes] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }
    loadInvestigation(slug)
      .then((data) => {
        setInvestigation(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      });
  }, [slug]);

  const filtered = useMemo(() => {
    if (!investigation) {
      return null;
    }
    return filterInvestigationByClusterHeuristic(investigation, filters.heuristic);
  }, [investigation, filters.heuristic]);

  const edges = useMemo(
    () => (filtered ? filterEdges(filtered.edges, filters) : []),
    [filtered, filters],
  );

  const heuristics = useMemo(() => {
    if (!investigation) {
      return [];
    }
    const set = new Set<string>();
    for (const c of investigation.clusters) {
      for (const e of c.evidence) {
        set.add(e.rule);
      }
    }
    return [...set].sort();
  }, [investigation]);

  const selectedNode: InvestigationNode | null = useMemo(() => {
    if (!investigation || !selectedAddress) {
      return null;
    }
    return (
      investigation.nodes.find((n) => n.address.toLowerCase() === selectedAddress.toLowerCase()) ?? {
        address: selectedAddress,
        label: null,
        tx_count: 0,
        categories: ["live-expand"],
      }
    );
  }, [investigation, selectedAddress]);

  const selectedCluster = useMemo(() => {
    if (!investigation || !selectedAddress) {
      return null;
    }
    return memberClusterMap(investigation).get(selectedAddress.toLowerCase()) ?? null;
  }, [investigation, selectedAddress]);

  if (!manifest) {
    return <p className="p-10 text-slate-400">Unknown investigation.</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 p-10">
        <p className="text-red-300">{error}</p>
        <Link to="/" className="text-accent hover:underline">
          Back to gallery
        </Link>
      </div>
    );
  }

  if (!investigation || !filtered) {
    return <p className="p-10 text-slate-400">Loading investigation…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <Link to="/" className="text-sm text-accent hover:underline">
        ← Investigations gallery
      </Link>
      <InvestigationHeader
        title={manifest.title}
        summary={manifest.summary}
        referenceUrl={manifest.referenceUrl}
        chain={manifest.chain}
        seedAddress={manifest.seedAddress}
        generatedAt={String(investigation.metadata.generated_at)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <GraphFiltersPanel filters={filters} onChange={setFilters} availableHeuristics={heuristics} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-surface-border px-3 py-1.5 text-sm text-slate-200 hover:bg-surface-raised"
            onClick={() =>
              downloadTextFile(`${slug}.json`, JSON.stringify(investigation, null, 2), "application/json")
            }
          >
            Download JSON
          </button>
          {selectedAddress ? (
            <LiveExpandButton
              chain={investigation.metadata.chain}
              address={selectedAddress}
              onEdges={(addr) => setExtraNodes((prev) => (prev.includes(addr) ? prev : [...prev, addr]))}
            />
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSelectedAddress(null)}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      >
        Clear selection
      </button>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <ClusterGraph
          investigation={filtered}
          edges={edges}
          selectedAddress={selectedAddress}
          onSelect={setSelectedAddress}
          extraNodes={extraNodes}
        />
        <EvidencePanel chain={investigation.metadata.chain} node={selectedNode} cluster={selectedCluster} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Clusters</h2>
        <ClusterTable clusters={filtered.clusters} onSelectMember={setSelectedAddress} />
      </section>
    </div>
  );
}