import { z } from "zod";

const isoDate = z.union([z.string().datetime(), z.string()]);

export const investigationNodeSchema = z.object({
  address: z.string(),
  label: z.string().nullable().optional(),
  first_seen: isoDate.nullable().optional(),
  tx_count: z.number().int().nonnegative(),
  categories: z.array(z.string()).default([]),
});

export const investigationEdgeSchema = z.object({
  from_address: z.string(),
  to_address: z.string(),
  token_symbol: z.string(),
  token_address: z.string().nullable().optional(),
  total_value: z.string(),
  transfer_count: z.number().int().nonnegative(),
  first_timestamp: isoDate.nullable().optional(),
  last_timestamp: isoDate.nullable().optional(),
});

export const evidenceRecordSchema = z.object({
  rule: z.string(),
  addresses: z.array(z.string()),
  confidence: z.number(),
  tx_hashes: z.array(z.string()).default([]),
  detail: z.string().default(""),
});

export const clusterRecordSchema = z.object({
  cluster_id: z.string(),
  members: z.array(z.string()),
  score: z.number(),
  evidence: z.array(evidenceRecordSchema).default([]),
});

export const investigationMetadataSchema = z.object({
  schema_version: z.string(),
  chain: z.string(),
  seed_address: z.string(),
  data_source: z.string(),
  generated_at: isoDate,
  parameters: z.record(z.unknown()).default({}),
  heuristic_weights: z.record(z.number()).default({}),
});

export const investigationSchema = z.object({
  metadata: investigationMetadataSchema,
  nodes: z.array(investigationNodeSchema),
  edges: z.array(investigationEdgeSchema),
  clusters: z.array(clusterRecordSchema),
});

export type Investigation = z.infer<typeof investigationSchema>;
export type InvestigationNode = z.infer<typeof investigationNodeSchema>;
export type InvestigationEdge = z.infer<typeof investigationEdgeSchema>;
export type ClusterRecord = z.infer<typeof clusterRecordSchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;