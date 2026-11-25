import { siteConfig } from "@/shared/config";
import { Container, GitHubIcon, LinkedInIcon, TelegramIcon } from "@/shared/ui";

const socials = [
  { href: siteConfig.contacts.github, label: "GitHub", Icon: GitHubIcon },
  { href: siteConfig.contacts.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: siteConfig.contacts.telegram, label: "Telegram", Icon: TelegramIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Designed and directed by me, implemented with AI coding
          agents.
        </p>
        <ul className="flex items-center gap-1">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-card hover:text-fg"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
