import { experience, ExperienceEntry } from "@/entities/experience-item";
import { Section } from "@/shared/ui";

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Engineer by training, crypto-native by choice"
      description="Measurable process work at P&G, community and product feedback at Arkham, and independent research that feeds everything I build."
    >
      <ol className="relative before:absolute before:top-2 before:bottom-2 before:left-[4.5px] before:w-px before:bg-border sm:before:left-[calc(11rem-0.5px)]">
        {experience.map((item) => (
          <ExperienceEntry key={item.id} item={item} />
        ))}
      </ol>
    </Section>
  );
}
