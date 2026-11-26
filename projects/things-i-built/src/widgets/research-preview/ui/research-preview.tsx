import { ArrowRight } from "lucide-react";

import { type ResearchNote, ResearchNoteCard } from "@/entities/research-note";
import { ButtonLink, Section } from "@/shared/ui";

export function ResearchPreview({ notes }: { notes: readonly ResearchNote[] }) {
  if (notes.length === 0) return null;

  return (
    <Section
      id="research"
      eyebrow="Research"
      title="How I think about tokens and markets"
      description="Frameworks and research notes. The tools above are these ideas turned into software."
      action={
        <ButtonLink href="/research/" variant="secondary" size="sm">
          All research <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {notes.slice(0, 4).map((note) => (
          <ResearchNoteCard key={note.slug} note={note} />
        ))}
      </div>
    </Section>
  );
}
