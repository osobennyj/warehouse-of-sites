import { getFeaturedProjects } from "@/entities/project/server";
import { JsonLd, personJsonLd } from "@/shared/seo";
import { ContactBlock } from "@/widgets/contact-block";
import { ExperienceTimeline } from "@/widgets/experience-timeline";
import { FeaturedProjects } from "@/widgets/featured-projects";
import { Hero } from "@/widgets/hero";

export function HomePage() {
  const projects = getFeaturedProjects();

  return (
    <>
      <JsonLd data={personJsonLd()} />
      <Hero projects={projects} />
      <FeaturedProjects projects={projects} />
      <ExperienceTimeline />
      <ContactBlock />
    </>
  );
}
