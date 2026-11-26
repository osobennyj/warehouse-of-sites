import { experience, ExperienceEntry } from "@/entities/experience-item";
import { Section } from "@/shared/ui";

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="From process engineering to crypto"
      description="Process engineering at P&G, community management at Arkham, independent research since 2023."
    >
      <ol className="before:bg-border relative before:absolute before:top-2 before:bottom-2 before:left-[4.5px] before:w-px sm:before:left-[calc(11rem-0.5px)]">
        {experience.map((item) => (
          <ExperienceEntry key={item.id} item={item} />
        ))}
      </ol>
    </Section>
  );
}
