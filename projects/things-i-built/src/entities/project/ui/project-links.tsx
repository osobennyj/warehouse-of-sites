import { ArrowUpRight } from "lucide-react";

import { ButtonLink, GitHubIcon } from "@/shared/ui";

import type { Project } from "../model/types";

interface ProjectLinksProps {
  project: Pick<Project, "title" | "links">;
  size?: "sm" | "md";
  className?: string;
}

export function ProjectLinks({ project, size = "sm", className }: ProjectLinksProps) {
  const { live, github } = project.links;
  if (!live && !github) return null;

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {live && (
        <ButtonLink href={live} size={size} aria-label={`${project.title}: live demo (opens in a new tab)`}>
          Live demo <ArrowUpRight aria-hidden className="size-4" />
        </ButtonLink>
      )}
      {github && (
        <ButtonLink
          href={github}
          size={size}
          variant="secondary"
          aria-label={`${project.title}: source code on GitHub (opens in a new tab)`}
        >
          <GitHubIcon className="size-4" /> GitHub
        </ButtonLink>
      )}
    </div>
  );
}
