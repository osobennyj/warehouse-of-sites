import { ArrowRight } from "lucide-react";

import { isDemoSlug, projectDemoPath, type DemoSlug } from "@/shared/config/demos";
import { ButtonLink } from "@/shared/ui";

import { resolveProjectLiveHref } from "../lib/resolve-live-href";
import type { Project } from "../model/types";

interface ProjectLinksProps {
  project: Pick<Project, "title" | "slug" | "links">;
  size?: "sm" | "md";
  className?: string;
}

export function ProjectLinks({ project, size = "sm", className }: ProjectLinksProps) {
  const live = resolveProjectLiveHref(project.slug, project.links.live);
  if (!live) return null;

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      <ButtonLink href={live} size={size} aria-label={`${project.title}: demo`}>
        Demo <ArrowRight aria-hidden className="size-4" />
      </ButtonLink>
    </div>
  );
}

export function walletPasteDemoHref(slug: string): string | null {
  if (slug !== "wallet-cluster-investigator" || !isDemoSlug(slug)) return null;
  return `${projectDemoPath(slug as DemoSlug)}#/analyze`;
}
