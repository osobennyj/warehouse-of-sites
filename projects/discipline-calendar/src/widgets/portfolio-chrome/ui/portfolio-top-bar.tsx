import { portfolioHome } from "@/shared/config/demo";

export function PortfolioTopBar({ title }: { title: string }) {
  return (
    <header className="portfolio-top-bar">
      <div className="portfolio-top-bar__inner">
        <a href={portfolioHome} className="portfolio-home-link">
          Things I Built
        </a>
        <p>{title}</p>
      </div>
    </header>
  );
}
