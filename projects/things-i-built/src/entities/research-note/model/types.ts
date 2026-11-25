import type { z } from "zod";

import type { researchNoteFrontmatterSchema } from "./schema";

export type ResearchNote = z.output<typeof researchNoteFrontmatterSchema> & { slug: string };

export interface ResearchNoteWithContent {
  note: ResearchNote;
  html: string;
}
