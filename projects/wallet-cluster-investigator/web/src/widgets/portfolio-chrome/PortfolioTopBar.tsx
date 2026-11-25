const portfolioHome =
  import.meta.env.VITE_PORTFOLIO_HOME ?? "https://osobennyj.github.io/warehouse-of-sites/";

export function PortfolioTopBar() {
  return (
    <header className="portfolio-top-bar fixed inset-x-0 top-0 z-[100] border-b border-zinc-800 bg-zinc-950 shadow-[0_1px_0_0_rgb(255_255_255/0.06)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={portfolioHome} className="portfolio-home-link">
          Things I Built
        </a>
        <p className="truncate text-sm text-zinc-400">Wallet Cluster Investigator</p>
      </div>
    </header>
  );
}