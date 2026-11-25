import type { Metadata } from "next";

import { ResearchNoteCard } from "@/entities/research-note";
import { getResearchNotes } from "@/entities/research-note/server";
import { buildPageMetadata } from "@/shared/seo";
import { Container, PageIntro } from "@/shared/ui";

export const researchListMetadata: Metadata = buildPageMetadata({
  title: "Research",
  description: "Tokenomics frameworks, on-chain notes and dashboards that inform the tools I build.",
  path: "/research/",
});

export function ResearchListPage() {
  const notes = getResearchNotes();

  return (
    <>
      <PageIntro
        eyebrow="Research"
        title="Notes and dashboards"
        description="Frameworks plus documented outcomes: tools from this site, Arkham community work, carry process notes, and pre-crypto engineering wins."
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