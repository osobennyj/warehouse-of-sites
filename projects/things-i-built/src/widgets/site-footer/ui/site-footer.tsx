import { siteConfig } from "@/shared/config";
import { Container, GitHubIcon, LinkedInIcon, TelegramIcon } from "@/shared/ui";

const socials = [
  { href: siteConfig.contacts.github, label: "GitHub", Icon: GitHubIcon },
  { href: siteConfig.contacts.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: siteConfig.contacts.telegram, label: "Telegram", Icon: TelegramIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border/60 border-t py-10">
      <Container className="text-muted flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <div className="space-y-1 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Code written with AI coding assistants.
          </p>
          <p className="text-xs">Nothing on this site is investment advice.</p>
        </div>
        <ul className="flex items-center gap-1">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="hover:bg-card hover:text-fg flex size-9 items-center justify-center rounded-full transition-colors"
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
