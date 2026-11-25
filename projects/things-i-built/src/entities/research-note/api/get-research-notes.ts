import { readCollection, renderMarkdown } from "@/shared/lib/content";

import { researchNoteFrontmatterSchema } from "../model/schema";
import type { ResearchNote, ResearchNoteWithContent } from "../model/types";

function loadEntries() {
  return readCollection("research", researchNoteFrontmatterSchema);
}

export function getResearchNotes(): ResearchNote[] {
  return loadEntries()
    .map(({ slug, data }) => ({ slug, ...data }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Dashboards live on external platforms, so only written notes get their own page. */
export function getResearchNoteSlugs(): string[] {
  return getResearchNotes()
    .filter((note) => note.kind === "note")
    .map((note) => note.slug);
}

export async function getResearchNote(slug: string): Promise<ResearchNoteWithContent | null> {
  const entry = loadEntries().find((item) => item.slug === slug && item.data.kind === "note");
  if (!entry) return null;
  return { note: { slug, ...entry.data }, html: await renderMarkdown(entry.body) };
}
