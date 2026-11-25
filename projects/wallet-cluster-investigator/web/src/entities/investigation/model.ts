import { investigationSchema, type ClusterRecord, type Investigation } from "./schema";

export type InvestigationManifestEntry = {
  slug: string;
  title: string;
  summary: string;
  referenceUrl: string;
  chain: string;
  seedAddress: string;
};

export const INVESTIGATION_MANIFEST: InvestigationManifestEntry[] = [
  {
    slug: "bybit-exploit-feb2025",
    title: "Bybit exploit — labeled exploiter wallet",
    summary:
      "Blockscout-tagged Bybit exploiter address; depth 1, high min native value, expansion stops at labeled CEX/protocol nodes.",
    referenceUrl: "https://t.me/investigations/217",
    chain: "ethereum",
    seedAddress: "0x47666Fab8bd0Ac7003bce3f5C3585383F09486E2",
  },
  {
    slug: "bybit-exploit-hop-1",
    title: "Bybit exploit — hop-1 bridge wallet",
    summary:
      "Intermediate wallet (~51 native txs) in the public Bybit Feb 2025 fund-flow write-ups.",
    referenceUrl: "https://eth.blockscout.com/address/0xa4b2fd68593b6f34e51cb9edb66e71c1b4ab449e",
    chain: "ethereum",
    seedAddress: "0xa4b2fd68593b6f34e51cb9edb66e71c1b4ab449e",
  },
  {
    slug: "bybit-exploit-hop-2",
    title: "Bybit exploit — hop-2 funder wallet",
    summary: "Low-activity upstream wallet with only a handful of native transfers.",
    referenceUrl: "https://t.me/investigations/217",
    chain: "ethereum",
    seedAddress: "0x4cEEAd532B90D7D39a92a78186425ea80AEcb9cA",
  },
];

export function parseInvestigation(data: unknown): Investigation {
  return investigationSchema.parse(data);
}

export function clusterColor(clusterId: string | null, index: number): string {
  if (!clusterId) {
    return "#64748b";
  }
  const palette = ["#6ee7b7", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185"];
  return palette[index % palette.length] ?? "#6ee7b7";
}

export function memberClusterMap(investigation: Investigation): Map<string, ClusterRecord> {
  const map = new Map<string, ClusterRecord>();
  for (const cluster of investigation.clusters) {
    for (const member of cluster.members) {
      map.set(member.toLowerCase(), cluster);
    }
  }
  return map;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}