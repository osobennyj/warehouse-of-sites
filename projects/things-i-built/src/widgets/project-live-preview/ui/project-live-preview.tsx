import { ExternalLink } from "lucide-react";

import { ProjectCover, ProjectLinks, type Project } from "@/entities/project";
import { isDemoSlug, projectDemoUrl } from "@/shared/config/demos";
import { cn } from "@/shared/lib";
import { ButtonLink } from "@/shared/ui";

type ProjectLivePreviewProps = {
  project: Project;
  className?: string;
};

export function ProjectLivePreview({ project, className }: ProjectLivePreviewProps) {
  const demoUrl = isDemoSlug(project.slug) ? projectDemoUrl(project.slug) : project.links.live;
  if (!demoUrl) return null;

  return (
    <section aria-labelledby="project-live-title" className={cn("mt-10", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="project-live-title" className="text-lg font-semibold tracking-tight">
            Live preview
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Open the working MVP in a new tab or scroll the embedded view below.
          </p>
        </div>
        <ButtonLink href={demoUrl} className="shrink-0">
          Open MVP <ExternalLink aria-hidden className="size-4" />
        </ButtonLink>
      </div>
      <h3 className="sr-only">Product screenshot</h3>
      <ProjectCover
        slug={project.slug}
        title={project.title}
        cover={project.cover}
        accent={project.accent}
        className="mt-5 rounded-2xl border border-border"
        priority
      />
      <LiveFrame demoUrl={demoUrl} title={project.title} />
      <ProjectLinks project={{ ...project, links: { ...project.links, live: demoUrl } }} size="md" className="mt-6" />
    </section>
  );
}

function LiveFrame({ demoUrl, title }: { demoUrl: string; title: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card/40 shadow-inner">
      <iframe
        title={`${title} live demo`}
        src={demoUrl}
        className="h-[min(70vh,520px)] w-full bg-bg"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}