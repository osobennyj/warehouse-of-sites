import type { Metadata } from "next";

import { ResearchNoteCard } from "@/entities/research-note";
import { getResearchNotes } from "@/entities/research-note/server";
import { buildPageMetadata } from "@/shared/seo";
import { Container, PageIntro } from "@/shared/ui";

export const researchListMetadata: Metadata = buildPageMetadata({
  title: "Research",
  description:
    "Short notes on token unlock risk, funding rate comparison, community feedback at Arkham and process engineering at P&G.",
  path: "/research/",
});

export function ResearchListPage() {
  const notes = getResearchNotes();

  return (
    <>
      <PageIntro
        eyebrow="Research"
        title="Research notes"
        description="Short notes on how I analyze tokens and funding, plus background from Arkham and P&G."
      />
      <Container className="pb-20">
        <ul className="grid gap-4">
          {notes.map((note) => (
            <li key={note.slug}>
              <ResearchNoteCard note={note} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
