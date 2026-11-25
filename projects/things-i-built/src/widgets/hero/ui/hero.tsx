import { ArrowDown, Download, Mail } from "lucide-react";

import { type Project, ProjectStatusBadge } from "@/entities/project";
import { siteConfig } from "@/shared/config";
import { ButtonLink, Container } from "@/shared/ui";

const credentials = [
  { value: "Arkham", label: "Led 2 CIS communities" },
  { value: "$70k+/yr", label: "Cost savings at P&G" },
  { value: "AI-native", label: "Spec → agent → review → ship" },
] as const;

function BuildLog({ projects }: { projects: readonly Project[] }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card/70 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-rose-400/80" />
        <span className="size-2.5 rounded-full bg-amber-300/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-xs text-muted">~/things-i-built</span>
      </div>
      <div className="space-y-3 p-5 font-mono text-sm">
        <p className="text-muted">
          <span className="text-accent">$</span> ls projects/
        </p>
        <ul className="space-y-2.5">
          {projects.map((project) => (
            <li key={project.slug} className="flex items-center justify-between gap-3">
              <span className="truncate text-fg/90">{project.slug}</span>
              <ProjectStatusBadge status={project.status} />
            </li>
          ))}
        </ul>
        <p className="text-muted">
          <span className="text-accent">$</span> <span className="animate-caret">▍</span>
        </p>
      </div>
    </div>
  );
}

export function Hero({ projects }: { projects: readonly Project[] }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 mask-fade opacity-50" />
      <Container className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Open to on-chain research, Web3 growth & AI-builder roles
          </p>
          <h1 id="hero-title" className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            I turn crypto research into{" "}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              working tools.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            I&apos;m <strong className="font-medium text-fg">{siteConfig.name}</strong>, {siteConfig.role}. Dashboards,
            bots and AI agents that make on-chain data actionable. Ex-Arkham community lead, ex-P&amp;G engineer.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/#projects">
              View projects <ArrowDown aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink href={siteConfig.cvPath} asset download variant="secondary">
              <Download aria-hidden className="size-4" /> Download CV
            </ButtonLink>
            <ButtonLink href="/#contact" variant="ghost">
              <Mail aria-hidden className="size-4" /> Contact
            </ButtonLink>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-border/70 pt-6">
            {credentials.map((item) => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-xl font-semibold tracking-tight sm:text-2xl">{item.value}</dd>
                <dd className="mt-1 text-sm text-muted">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <BuildLog projects={projects} />
      </Container>
    </section>
  );
}
