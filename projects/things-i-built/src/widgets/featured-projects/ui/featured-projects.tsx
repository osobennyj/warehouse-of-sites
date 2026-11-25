import { ArrowRight } from "lucide-react";

import { type Project, ProjectCard } from "@/entities/project";
import { ButtonLink, Section } from "@/shared/ui";

export function FeaturedProjects({ projects }: { projects: readonly Project[] }) {
  return (
    <Section
      id="projects"
      eyebrow="Things I built"
      title="Tools born from my own research workflow"
      description="Each project starts from a problem I hit as an analyst or trader, then ships as a deployed product with tests, CI and a written case study."
      action={
        <ButtonLink href="/projects/" variant="secondary" size="sm">
          All projects <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} priority={index < 2} />
        ))}
      </div>
    </Section>
  );
}
