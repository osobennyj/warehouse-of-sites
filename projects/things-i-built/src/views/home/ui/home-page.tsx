import { getFeaturedProjects } from "@/entities/project/server";
import { getResearchNotes } from "@/entities/research-note/server";
import { JsonLd, personJsonLd } from "@/shared/seo";
import { AiProcess } from "@/widgets/ai-process";
import { ContactBlock } from "@/widgets/contact-block";
import { ExperienceTimeline } from "@/widgets/experience-timeline";
import { FeaturedProjects } from "@/widgets/featured-projects";
import { Hero } from "@/widgets/hero";
import { ResearchPreview } from "@/widgets/research-preview";

export function HomePage() {
  const projects = getFeaturedProjects();

  return (
    <>
      <JsonLd data={personJsonLd()} />
      <Hero />
      <FeaturedProjects projects={projects} />
      <AiProcess />
      <ResearchPreview notes={getResearchNotes()} />
      <ExperienceTimeline />
      <ContactBlock />
    </>
  );
}
