import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Project } from "../model/types";
import { ProjectCover } from "./project-cover";
import { ProjectLinks } from "./project-links";
import { ProjectStatusBadge } from "./project-status-badge";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const href = `/projects/${project.slug}/`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/50 transition-[border-color,box-shadow,transform] duration-300 focus-within:border-fg/30 hover:-translate-y-0.5 hover:border-fg/25 hover:shadow-[0_24px_60px_-30px_rgb(var(--accent-rgb)/0.45)] motion-reduce:hover:translate-y-0">
      <ProjectCover {...project} priority={priority} className="border-b border-border" />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
        </div>

        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            {/* Stretched link: the whole card opens the case study, while the buttons below stay independently clickable. */}
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {project.title}
            </Link>
          </h3>
          <p className="mt-2 leading-relaxed text-muted">{project.tagline}</p>
        </div>

        <dl className="flex items-baseline gap-3 rounded-xl border border-border/70 bg-bg/40 px-4 py-3">
          <dt className="sr-only">Key metric</dt>
          <dd className="font-mono text-lg font-semibold text-accent">{project.metric.value}</dd>
          <dd className="text-sm text-muted">{project.metric.label}</dd>
        </dl>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((item) => (
            <li key={item} className="rounded-md bg-fg/[0.06] px-2 py-1 font-mono text-xs text-fg/80">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <ProjectLinks project={project} className="relative z-10 flex flex-wrap gap-2" />
          <span className="inline-flex items-center gap-1 text-sm font-medium text-fg/80 transition-colors group-hover:text-accent">
            Case study
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
