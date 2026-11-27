import Link from "next/link";

import { ButtonLink } from "@/shared/ui";

import type { Project } from "../model/types";
import { ProjectCover } from "./project-cover";
import { ProjectLinks } from "./project-links";
import { ProjectStatusBadge } from "./project-status-badge";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const href = `/projects/${project.slug}/`;

  return (
    <article className="group border-border bg-card/50 focus-within:border-fg/30 hover:border-fg/25 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgb(var(--accent-rgb)/0.45)] motion-reduce:hover:translate-y-0">
      <ProjectCover {...project} priority={priority} className="border-border border-b" />

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
          <p className="text-muted mt-2 leading-relaxed">{project.tagline}</p>
        </div>

        {(project.solves || project.decision) && (
          <dl className="space-y-1.5 text-sm leading-relaxed">
            {project.solves && (
              <div>
                <dt className="text-fg inline font-medium">Problem: </dt>
                <dd className="text-muted inline">{project.solves}</dd>
              </div>
            )}
            {project.decision && (
              <div>
                <dt className="text-fg inline font-medium">My call: </dt>
                <dd className="text-muted inline">{project.decision}</dd>
              </div>
            )}
          </dl>
        )}

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((item) => (
            <li key={item} className="bg-fg/[0.06] text-fg/80 rounded-md px-2 py-1 font-mono text-xs">
              {item}
            </li>
          ))}
        </ul>

        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-2">
          <ProjectLinks project={project} className="contents" />
          <ButtonLink href={href} size="sm" variant="secondary" aria-label={`${project.title}: case study`}>
            Case study
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
