import { ArrowRight } from "lucide-react";

import { type Project, ProjectCard } from "@/entities/project";
import { ButtonLink, Section } from "@/shared/ui";

export function FeaturedProjects({ projects }: { projects: readonly Project[] }) {
  return (
    <Section
      id="projects"
      eyebrow="Things I built"
      title="Tools born from my own research workflow"
      description="Frameworks and research notes. The tools above are these ideas turned into software."
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
