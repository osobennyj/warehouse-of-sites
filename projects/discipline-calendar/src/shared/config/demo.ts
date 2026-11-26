/** Public portfolio build: no login, sample data kept in the browser. */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const portfolioHome =
  process.env.NEXT_PUBLIC_PORTFOLIO_HOME ?? "https://osobennyj.github.io/warehouse-of-sites/";
