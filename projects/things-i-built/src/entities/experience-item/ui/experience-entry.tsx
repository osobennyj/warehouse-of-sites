import type { ExperienceItem } from "../model/experience";

export function ExperienceEntry({ item }: { item: ExperienceItem }) {
  return (
    <li className="relative grid gap-3 pb-12 pl-8 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:pl-0">
      <span
        aria-hidden
        className="absolute top-2 left-0 size-2.5 rounded-full border-2 border-accent bg-bg sm:left-[calc(10rem+1rem-5px)]"
      />
      <p className="font-mono text-sm text-muted sm:pt-0.5 sm:text-right sm:pr-8">{item.period}</p>
      <div className="sm:pl-8">
        <h3 className="text-lg font-semibold tracking-tight">
          {item.role} <span className="text-muted">· {item.organization}</span>
        </h3>
        <p className="mt-2 leading-relaxed text-muted">{item.summary}</p>
        <ul className="mt-3 space-y-1.5">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-[0.95rem] leading-relaxed text-fg/85">
              <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
