import { ExternalLink } from "lucide-react";

import { ProjectCover, ProjectLinks, type Project } from "@/entities/project";
import { isDemoSlug, projectDemoUrl } from "@/shared/config/demos";
import { cn } from "@/shared/lib";
import { ButtonLink } from "@/shared/ui";

const HONESTY: Partial<Record<string, string>> = {
  "funding-rate-radar": "Live funding data and fee-aware arb math for the next payment window.",
  "wallet-cluster-investigator":
    "Work in progress: no Arkham API. Open the paste flow for a Blockscout preview, or saved investigations for full heuristics.",
  "ai-token-due-diligence": "Checklist and scoring work without keys. Narrative in samples is mock unless you add an LLM key locally.",
  "defi-strategist-mcp": "Sized stablecoin recommendation on snapshots. MCP + live feeds need the server outside this static page.",
};

type ProjectLivePreviewProps = {
  project: Project;
  className?: string;
};

export function ProjectLivePreview({ project, className }: ProjectLivePreviewProps) {
  const demoUrl = isDemoSlug(project.slug) ? projectDemoUrl(project.slug) : project.links.live;
  if (!demoUrl) return null;

  const walletPasteUrl = project.slug === "wallet-cluster-investigator" ? `${demoUrl}#/analyze` : null;
  const honesty = HONESTY[project.slug];

  return (
    <section aria-labelledby="project-live-title" className={cn("mt-10", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="project-live-title" className="text-lg font-semibold tracking-tight">
            Try the demo
          </h2>
          {honesty ? <p className="mt-1 max-w-xl text-sm text-muted">{honesty}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={demoUrl} className="shrink-0">
            Open demo <ExternalLink aria-hidden className="size-4" />
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
        className="mt-5 rounded-2xl border border-border"
        priority
      />
      <LiveFrame src={demoUrl} title={project.title} />
      <ProjectLinks project={{ ...project, links: { ...project.links, live: demoUrl } }} size="md" className="mt-6" />
    </section>
  );
}

function LiveFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card/40 shadow-inner">
      <iframe
        title={`${title} live demo`}
        src={src}
        className="h-[min(70vh,520px)] w-full bg-bg"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}