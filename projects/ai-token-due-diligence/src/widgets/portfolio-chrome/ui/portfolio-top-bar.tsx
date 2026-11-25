import { withBasePath } from "@/shared/config/site";

const portfolioHome =
  process.env.NEXT_PUBLIC_PORTFOLIO_HOME ?? "https://osobennyj.github.io/warehouse-of-sites/";

export function PortfolioTopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-zinc-800 bg-zinc-950 shadow-[0_1px_0_0_rgb(255_255_255/0.06)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={portfolioHome} className="portfolio-home-link">
          Things I Built
        </a>
        <nav className="flex items-center gap-4 text-sm text-zinc-400">
          <a href={withBasePath("/gallery/")} className="transition hover:text-zinc-100">
            Gallery
          </a>
        </nav>
      </div>
    </header>
  );
}