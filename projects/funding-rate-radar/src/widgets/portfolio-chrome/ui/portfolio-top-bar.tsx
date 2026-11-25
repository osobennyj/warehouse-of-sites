const portfolioHome =
  process.env.NEXT_PUBLIC_PORTFOLIO_HOME ?? "https://osobennyj.github.io/warehouse-of-sites/";

type PortfolioTopBarProps = {
  title: string;
};

export function PortfolioTopBar({ title }: PortfolioTopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-zinc-800 bg-zinc-950 shadow-[0_1px_0_0_rgb(255_255_255/0.06)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href={portfolioHome}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-zinc-50 px-3.5 text-sm font-medium text-zinc-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
        >
          Things I Built
        </a>
        <p className="truncate text-sm text-zinc-400">{title}</p>
      </div>
    </header>
  );
}