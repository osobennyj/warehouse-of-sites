import { ArrowRight } from "lucide-react";

import { isDemoSlug, projectDemoPath, type DemoSlug } from "@/shared/config/demos";
import { ButtonLink, GitHubIcon } from "@/shared/ui";

import { resolveProjectLiveHref } from "../lib/resolve-live-href";
import type { Project } from "../model/types";

interface ProjectLinksProps {
  project: Pick<Project, "title" | "slug" | "links">;
  size?: "sm" | "md";
  className?: string;
}

function isPullRequestUrl(href: string): boolean {
  return /github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(href);
}

export function ProjectLinks({ project, size = "sm", className }: ProjectLinksProps) {
  const live = resolveProjectLiveHref(project.slug, project.links.live);
  const { github } = project.links;
  if (!live && !github) return null;

  const repoLabel = github && isPullRequestUrl(github) ? "Pull request" : "GitHub";

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {live && (
        <ButtonLink href={live} size={size} aria-label={`${project.title}: demo`}>
          Demo <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      )}
      {github && (
        <ButtonLink
          href={github}
          size={size}
          variant={live ? "secondary" : "primary"}
          aria-label={`${project.title}: ${repoLabel.toLowerCase()} (opens in a new tab)`}
        >
          <GitHubIcon className="size-4" /> {repoLabel}
        </ButtonLink>
      )}
    </div>
  );
}

export function walletPasteDemoHref(slug: string): string | null {
  if (slug !== "wallet-cluster-investigator" || !isDemoSlug(slug)) return null;
  return `${projectDemoPath(slug as DemoSlug)}#/analyze`;
}
