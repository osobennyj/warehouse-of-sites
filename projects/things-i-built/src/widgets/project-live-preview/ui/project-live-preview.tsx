import { ArrowRight } from "lucide-react";

import { ProjectCover, ProjectLinks, walletPasteDemoHref, type Project } from "@/entities/project";
import { resolveProjectLiveHref } from "@/entities/project/lib/resolve-live-href";
import { cn } from "@/shared/lib";
import { ButtonLink } from "@/shared/ui";

const HONESTY: Partial<Record<string, string>> = {
  "funding-rate-radar": "Live funding data and fee-aware arb math for the next payment window.",
  "discipline-calendar": "Sample data in your browser. No account, no server, nothing is uploaded.",
  "grid-bot": "Simulated prices and fixed demo fees. No exchange connection, no real orders.",
};

type ProjectLivePreviewProps = {
  project: Project;
  className?: string;
};

export function ProjectLivePreview({ project, className }: ProjectLivePreviewProps) {
  const demoHref = resolveProjectLiveHref(project.slug, project.links.live);
  if (!demoHref) return null;

  const walletPasteUrl = walletPasteDemoHref(project.slug);
  const honesty = HONESTY[project.slug];

  return (
    <section aria-labelledby="project-live-title" className={cn("mt-10", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="project-live-title" className="text-lg font-semibold tracking-tight">
            Try the demo
          </h2>
          {honesty ? <p className="text-muted mt-1 max-w-xl text-sm">{honesty}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={demoHref} className="shrink-0">
            Open demo <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          {walletPasteUrl ? (
            <ButtonLink href={walletPasteUrl} variant="secondary" className="shrink-0">
              Paste wallet flow
            </ButtonLink>
          ) : null}
        </div>
      </div>
      <h3 className="sr-only">Product screenshot</h3>
      <ProjectCover
        slug={project.slug}
        title={project.title}
        cover={project.cover}
        accent={project.accent}
        className="border-border mt-5 rounded-2xl border"
        priority
      />
      <ProjectLinks project={project} size="md" className="mt-6" />
    </section>
  );
}
