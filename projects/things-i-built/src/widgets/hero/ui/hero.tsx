import { ArrowDown, Download, Mail } from "lucide-react";

import { type Project } from "@/entities/project";
import { siteConfig } from "@/shared/config";
import { ButtonLink, Container } from "@/shared/ui";

const credentials = [
  { value: "Arkham", label: "CIS Community Manager" },
  { value: "$70k+/yr", label: "Cost savings at P&G" },
  { value: "Research + code", label: "Trading tools" },
] as const;

/** Terminal listing order (first site layout, no status column). */
const TERMINAL_SLUGS = ["funding-rate-radar", "grid-bot"] as const;

function BuildLog({ projects }: { projects: readonly Project[] }) {
  const known = new Set(projects.map((p) => p.slug));
  const lines = TERMINAL_SLUGS.filter((slug) => known.has(slug));

  return (
    <div className="border-border bg-card/70 relative rounded-2xl border shadow-2xl shadow-black/20 backdrop-blur">
      <div className="border-border flex items-center gap-1.5 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-rose-400/80" />
        <span className="size-2.5 rounded-full bg-amber-300/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="text-muted ml-3 font-mono text-xs">~/things-i-built</span>
      </div>
      <div className="space-y-3 p-5 font-mono text-sm">
        <p className="text-muted">
          <span className="text-accent">$</span> ls projects/
        </p>
        <ul className="space-y-2.5">
          {lines.map((slug) => (
            <li key={slug} className="text-fg/90">
              {slug}
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
      <div aria-hidden className="bg-grid mask-fade pointer-events-none absolute inset-0 -z-10 opacity-50" />
      <Container className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="border-border bg-card/60 text-muted mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            Open to on-chain research, Web3 growth and builder roles
          </p>
          <h1 id="hero-title" className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            I turn crypto research into{" "}
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              working tools.
            </span>
          </h1>
          <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
            I&apos;m <strong className="text-fg font-medium">{siteConfig.name}</strong>, {siteConfig.role.charAt(0).toLowerCase() + siteConfig.role.slice(1)}. Dashboards,
            bots and agents that make on-chain data easier to act on. Arkham community manager, former P&amp;G engineer.
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
          <dl className="border-border/70 mt-12 grid max-w-xl grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-3">
            {credentials.map((item) => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl">
                  {item.value}
                </dd>
                <dd className="text-muted mt-1 text-sm">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <BuildLog projects={projects} />
      </Container>
    </section>
  );
}
