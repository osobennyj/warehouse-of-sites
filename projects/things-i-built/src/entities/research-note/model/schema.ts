import { z } from "zod";

export const RESEARCH_KINDS = ["note", "dashboard"] as const;

export const researchNoteFrontmatterSchema = z
  .object({
    title: z.string().min(5).max(100),
    summary: z.string().min(30).max(240),
    kind: z.enum(RESEARCH_KINDS).default("note"),
    tags: z.array(z.string().min(1)).max(4).default([]),
    externalUrl: z.url().optional(),
    readingMinutes: z.number().int().positive().optional(),
    date: z.coerce.date(),
  })
  .strict()
  .refine((note) => note.kind !== "dashboard" || note.externalUrl, {
    message: "dashboards must link to their externalUrl (e.g. Dune)",
    path: ["externalUrl"],
  });
