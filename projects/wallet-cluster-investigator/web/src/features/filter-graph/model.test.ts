import { describe, expect, it } from "vitest";
import { filterEdges, filterInvestigationByClusterHeuristic } from "./model";
import type { Investigation } from "@/entities/investigation";

const sample: Investigation = {
  metadata: {
    schema_version: "1.0.0",
    chain: "ethereum",
    seed_address: "0xseed",
    data_source: "test",
    generated_at: "2025-01-01T00:00:00",
    parameters: {},
    heuristic_weights: {},
  },
  nodes: [
    { address: "0xA", tx_count: 1, categories: [] },
    { address: "0xB", tx_count: 1, categories: [] },
    { address: "0xC", tx_count: 1, categories: [] },
  ],
  edges: [
    {
      from_address: "0xA",
      to_address: "0xB",
      token_symbol: "ETH",
      total_value: "1",
      transfer_count: 2,
      last_timestamp: "2025-02-01T00:00:00",
    },
    {
      from_address: "0xB",
      to_address: "0xC",
      token_symbol: "ETH",
      total_value: "1",
      transfer_count: 1,
      last_timestamp: "2024-06-01T00:00:00",
    },
  ],
  clusters: [
    {
      cluster_id: "c1",
      members: ["0xA", "0xB"],
      score: 0.8,
      evidence: [{ rule: "common_funder", addresses: ["0xA", "0xB"], confidence: 0.8, tx_hashes: [], detail: "" }],
    },
  ],
};

describe("filter-graph", () => {
  it("filters edges by transfer count and since", () => {
    const edges = filterEdges(sample.edges, {
      minTransferCount: 2,
      heuristic: "all",
      since: "2025-01-01T00:00:00",
    });
    expect(edges).toHaveLength(1);
    expect(edges[0]?.from_address).toBe("0xA");
  });

  it("filters investigation by heuristic members", () => {
    const filtered = filterInvestigationByClusterHeuristic(sample, "common_funder");
    expect(filtered.nodes).toHaveLength(2);
    expect(filtered.clusters).toHaveLength(1);
  });
});