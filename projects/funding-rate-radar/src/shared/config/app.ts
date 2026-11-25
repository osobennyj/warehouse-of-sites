export const MARKETS_PER_EXCHANGE = 50;
export const SNAPSHOT_REFRESH_MS = 5 * 60_000;
export const HISTORY_WINDOW_DAYS = 7;
export const REQUEST_TIMEOUT_MS = 12_000;
/** Data older than this is flagged as stale in the freshness indicator. */
export const STALE_AFTER_MS = 2 * SNAPSHOT_REFRESH_MS;
