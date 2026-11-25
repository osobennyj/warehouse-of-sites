import Link from "next/link";
import { notFound } from "next/navigation";

import { getResearchNote, getResearchNoteSlugs } from "@/entities/research-note/server";
import { formatMonthYear } from "@/shared/lib";
import { buildPageMetadata } from "@/shared/seo";
import { ButtonLink, Container, MarkdownContent } from "@/shared/ui";

type Props = { params: Promise<{ slug: string }> };

export function getResearchStaticParams() {
  return getResearchNoteSlugs().map((slug) => ({ slug }));
}

export async function buildResearchMetadata(slug: string) {
  const entry = await getResearchNote(slug);
  if (!entry) return null;
  return buildPageMetadata({
    title: entry.note.title,
    description: entry.note.summary,
    path: `/research/${slug}/`,
    type: "article",
  });
}

export async function ResearchDetailsPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getResearchNote(slug);
  if (!entry) notFound();

  const { note, html } = entry;

  return (
    <article className="pb-20">
      <Container className="max-w-3xl pt-12 sm:pt-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/research/" className="hover:text-fg">
                Research
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-fg">{note.title}</li>
          </ol>
        </nav>
        <header className="border-b border-border pb-10">
          <p className="font-mono text-xs tracking-wide text-muted uppercase">
            Note · {formatMonthYear(note.date)}
            {note.readingMinutes ? ` · ${note.readingMinutes} min read` : ""}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">{note.title}</h1>
          <p className="mt-4 text-lg text-muted">{note.summary}</p>
        </header>
        <div className="mt-10">
          <MarkdownContent html={html} />
        </div>
        <footer className="mt-14 border-t border-border pt-8">
          <ButtonLink href="/research/" variant="secondary">
            ← All research
          </ButtonLink>
        </footer>
      </Container>
    </article>
  );
}