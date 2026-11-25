import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import { useEffect, useRef } from "react";
import {
  clusterColor,
  memberClusterMap,
  shortenAddress,
  type ClusterRecord,
  type Investigation,
  type InvestigationEdge,
} from "@/entities/investigation";

type Props = {
  investigation: Investigation;
  edges: InvestigationEdge[];
  selectedAddress: string | null;
  onSelect: (address: string) => void;
  extraNodes?: string[];
};

function edgeWidth(edge: InvestigationEdge): number {
  const count = Math.min(edge.transfer_count, 50);
  return 1 + count / 4;
}

export function ClusterGraph({ investigation, edges, selectedAddress, onSelect, extraNodes = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const clusterByMember = memberClusterMap(investigation);
    const clusterIndex = new Map<string, number>(
      investigation.clusters.map((c, idx) => [c.cluster_id, idx]),
    );

    const nodeSet = new Set<string>();
    for (const n of investigation.nodes) {
      nodeSet.add(n.address.toLowerCase());
    }
    for (const e of edges) {
      nodeSet.add(e.from_address.toLowerCase());
      nodeSet.add(e.to_address.toLowerCase());
    }
    for (const extra of extraNodes) {
      nodeSet.add(extra.toLowerCase());
    }

    const nodesByAddress = new Map(
      investigation.nodes.map((n) => [n.address.toLowerCase(), n] as const),
    );

    const elements: ElementDefinition[] = [];
    for (const addr of nodeSet) {
      const node = nodesByAddress.get(addr);
      const cluster: ClusterRecord | undefined = clusterByMember.get(addr);
      const clusterIdx = cluster ? (clusterIndex.get(cluster.cluster_id) ?? 0) : -1;
      const volume = edges
        .filter((e) => e.from_address.toLowerCase() === addr || e.to_address.toLowerCase() === addr)
        .reduce((acc, e) => acc + e.transfer_count, 0);
      elements.push({
        data: {
          id: addr,
          label: node?.label ?? shortenAddress(addr),
          color: clusterColor(cluster?.cluster_id ?? null, clusterIdx),
          size: 24 + Math.min(volume, 40),
        },
      });
    }

    for (const edge of edges) {
      const id = `${edge.from_address}-${edge.to_address}-${edge.token_symbol}`;
      elements.push({
        data: {
          id,
          source: edge.from_address.toLowerCase(),
          target: edge.to_address.toLowerCase(),
          width: edgeWidth(edge),
          label: edge.token_symbol,
        },
      });
    }

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            label: "data(label)",
            color: "#e2e8f0",
            "font-size": 10,
            "text-valign": "bottom",
            "text-margin-y": 6,
            width: "data(size)",
            height: "data(size)",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            width: "data(width)",
            "line-color": "#475569",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            opacity: 0.75,
          },
        },
      ],
      layout: { name: "cose", animate: false },
    });

    cy.on("tap", "node", (evt) => {
      const id = evt.target.id();
      onSelect(id);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [investigation, edges, extraNodes, onSelect]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !selectedAddress) {
      return;
    }
    const node = cy.getElementById(selectedAddress.toLowerCase());
    if (node.nonempty()) {
      cy.elements().unselect();
      node.select();
    }
  }, [selectedAddress]);

  return (
    <div
      ref={containerRef}
      className="h-[min(62vh,560px)] w-full rounded-lg border border-surface-border bg-[#0a0c10]"
      aria-label="Investigation graph"
    />
  );
}