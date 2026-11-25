import { Mail } from "lucide-react";

import { CopyEmailButton } from "@/features/copy-email";
import { siteConfig } from "@/shared/config";
import { ButtonLink, Container, GitHubIcon, LinkedInIcon, TelegramIcon } from "@/shared/ui";

const channels = [
  { href: siteConfig.contacts.telegram, label: "Telegram", Icon: TelegramIcon },
  { href: siteConfig.contacts.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: siteConfig.contacts.github, label: "GitHub", Icon: GitHubIcon },
] as const;

export function ContactBlock() {
  const { email } = siteConfig.contacts;

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/50 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative">
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">Contact</p>
            <h2 id="contact-title" className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              If you are hiring for research, growth, or builder work, I would like to hear from you.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
              I usually reply within a day. I am glad to walk through how any project here was built and what I would do
              differently next time.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href={`mailto:${email}`}>
                <Mail aria-hidden className="size-4" /> {email}
              </ButtonLink>
              <CopyEmailButton email={email} />
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {channels.map(({ href, label, Icon }) => (
                <li key={label}>
                  <ButtonLink href={href} variant="ghost" size="sm" aria-label={`${label} (opens in a new tab)`}>
                    <Icon className="size-4" /> {label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
