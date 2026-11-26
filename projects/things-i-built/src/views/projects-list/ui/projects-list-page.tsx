import type { Metadata } from "next";

import { getProjects } from "@/entities/project/server";
import { buildPageMetadata } from "@/shared/seo";
import { Container, PageIntro } from "@/shared/ui";
import { ContactBlock } from "@/widgets/contact-block";
import { ProjectsCatalog } from "@/widgets/projects-catalog";

export const projectsListMetadata: Metadata = buildPageMetadata({
  title: "Projects",
  description:
    "Three trading research tools built with AI coding assistants: a funding-rate scanner, a grid bot simulator and a trading discipline journal.",
  path: "/projects/",
});

export function ProjectsListPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Projects"
        description="Each case study covers the problem, my decisions, the architecture and the limits."
      />
      <Container className="pb-8">
        <ProjectsCatalog projects={getProjects()} />
      </Container>
      <ContactBlock />
    </>
  );
}
