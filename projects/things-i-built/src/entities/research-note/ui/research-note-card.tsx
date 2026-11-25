import { ArrowUpRight, BarChart3, FileText } from "lucide-react";
import Link from "next/link";

import { formatMonthYear } from "@/shared/lib";

import type { ResearchNote } from "../model/types";

export function ResearchNoteCard({ note }: { note: ResearchNote }) {
  const isDashboard = note.kind === "dashboard";
  const Icon = isDashboard ? BarChart3 : FileText;
  const meta = [
    isDashboard ? "Dashboard" : "Note",
    formatMonthYear(note.date),
    note.readingMinutes ? `${note.readingMinutes} min read` : null,
  ].filter(Boolean);

  const title =
    isDashboard && note.externalUrl ? (
      <a
        href={note.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="after:absolute after:inset-0 focus-visible:outline-none"
      >
        {note.title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <Link href={`/research/${note.slug}/`} className="after:absolute after:inset-0 focus-visible:outline-none">
        {note.title}
      </Link>
    );

  return (
    <article className="group relative flex gap-5 rounded-2xl border border-border bg-card/40 p-6 transition-colors focus-within:border-fg/30 hover:border-fg/25">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg/60 text-accent">
        <Icon aria-hidden className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">{meta.join(" · ")}</p>
        <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{note.summary}</p>
      </div>
      <ArrowUpRight
        aria-hidden
        className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
      />
    </article>
  );
}
