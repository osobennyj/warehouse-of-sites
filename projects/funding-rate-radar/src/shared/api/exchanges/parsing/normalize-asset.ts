const MULTIPLIER_PREFIX = /^(?:1000000|100000|10000|1000|100|k)(?=[A-Z])/;
const KNOWN_ALIASES: Readonly<Record<string, string>> = {
  XBT: "BTC",
};

/**
 * Maps venue-specific base tickers to one canonical asset so that
 * Binance "1000PEPE", Hyperliquid "kPEPE" and OKX "PEPE" are compared as one market.
 * Funding rates are per unit of notional, so the contract multiplier does not affect them.
 */
export function normalizeAsset(rawBase: string): string {
  const upper = rawBase.trim().replace(MULTIPLIER_PREFIX, "").toUpperCase();
  return KNOWN_ALIASES[upper] ?? upper;
}
