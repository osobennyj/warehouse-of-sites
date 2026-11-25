import { z } from "zod";
import { ToolNameSchema } from "./schema";

/** Progress events streamed (as NDJSON) from the report generation endpoint to the UI. */
export const AgentEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stage"),
    stage: z.enum(["resolving", "researching", "scoring", "writing", "verifying", "saving"]),
    message: z.string(),
  }),
  z.object({ type: z.literal("tool-start"), tool: ToolNameSchema }),
  z.object({
    type: z.literal("tool-end"),
    tool: ToolNameSchema,
    ok: z.boolean(),
    durationMs: z.number(),
    summary: z.string(),
  }),
  z.object({ type: z.literal("done"), reportId: z.string(), cached: z.boolean() }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

export type AgentEvent = z.infer<typeof AgentEventSchema>;
export type AgentEventListener = (event: AgentEvent) => void;
