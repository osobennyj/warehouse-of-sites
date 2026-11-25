import { ArrowDown, Download, Mail } from "lucide-react";

import { siteConfig } from "@/shared/config";
import { ButtonLink, Container } from "@/shared/ui";

const credentials = [
  { value: "Arkham", label: "CIS Community Manager" },
  { value: "$70k+/yr", label: "Cost savings at P&G" },
  { value: "Just building things.", label: "Research tools I use myself" },
] as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 mask-fade opacity-50" />
      <Container className="max-w-3xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
          Open to on-chain research, Web3 growth and builder roles
        </p>
        <h1 id="hero-title" className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          I turn crypto research into{" "}
          <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            working tools.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          I&apos;m <strong className="font-medium text-fg">{siteConfig.name}</strong>, {siteConfig.role}. Dashboards,
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
        <dl className="mt-12 grid max-w-xl grid-cols-1 gap-6 border-t border-border/70 pt-6 sm:grid-cols-3">
          {credentials.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd className="text-xl font-semibold tracking-tight sm:text-2xl">{item.value}</dd>
              <dd className="mt-1 text-sm text-muted">{item.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}