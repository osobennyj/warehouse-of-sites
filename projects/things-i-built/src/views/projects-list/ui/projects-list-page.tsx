import type { Metadata } from "next";

import { getProjects } from "@/entities/project/server";
import { buildPageMetadata } from "@/shared/seo";
import { Container, PageIntro } from "@/shared/ui";
import { ContactBlock } from "@/widgets/contact-block";
import { ProjectsCatalog } from "@/widgets/projects-catalog";

export const projectsListMetadata: Metadata = buildPageMetadata({
  title: "Projects",
  description:
    "Crypto research tools built with AI coding agents: funding-rate arbitrage, wallet clustering, DeFi analytics for AI agents and token due diligence.",
  path: "/projects/",
});

export function ProjectsListPage() {
  return (
    <>
      <PageIntro
        eyebrow="Things I built"
        title="Every project, with the reasoning behind it"
        description="Filter by area. Each card opens a case study: the problem, the architecture, the trade-offs and what shipped."
      />
      <Container className="pb-8">
        <ProjectsCatalog projects={getProjects()} />
      </Container>
      <ContactBlock />
    </>
  );
}
