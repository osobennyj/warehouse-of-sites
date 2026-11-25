import { Bot, ClipboardList, FlaskConical, Network, Rocket, ScanSearch } from "lucide-react";

import { Section } from "@/shared/ui";

const steps = [
  {
    Icon: ClipboardList,
    owner: "Me",
    title: "Requirements",
    text: "Start from a real research or trading pain. Write the spec: users, data sources, metrics, edge cases.",
  },
  {
    Icon: Network,
    owner: "Me",
    title: "Architecture",
    text: "Choose the stack, module boundaries (FSD / clean modules) and interfaces for every external API.",
  },
  {
    Icon: Bot,
    owner: "Agent",
    title: "Implementation",
    text: "AI coding agents write the code in small, reviewable steps against the spec and engineering rules.",
  },
  {
    Icon: ScanSearch,
    owner: "Me",
    title: "Review",
    text: "I read every diff, challenge trade-offs and verify the numbers against the source data myself.",
  },
  {
    Icon: FlaskConical,
    owner: "Me + Agent",
    title: "Tests",
    text: "Unit tests for domain math, recorded API fixtures, an e2e smoke test — all gated in CI.",
  },
  {
    Icon: Rocket,
    owner: "Me",
    title: "Deploy & operate",
    text: "Ship to a public URL or my own VPS, monitor it, and iterate on what users actually do.",
  },
] as const;

export function AiProcess() {
  return (
    <Section
      id="how-i-build"
      eyebrow="How I build with AI"
      title="I own the decisions. The agent types fast."
      description="Being explicit about it is the point: domain knowledge, specs and review are where the value is — and those are mine."
      className="border-y border-border/60 bg-card/20"
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ Icon, owner, title, text }, index) => (
          <li key={title} className="relative rounded-2xl border border-border bg-bg/60 p-6">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, "0")} · {owner}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
