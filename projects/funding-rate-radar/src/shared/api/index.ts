import { env, REQUEST_TIMEOUT_MS } from "../config";
import { createExchangeSources } from "./exchanges";
import { createFetchHttpClient } from "./http";

export * from "./exchanges";
export { createFetchHttpClient, HttpError } from "./http";
export type { HttpClient } from "./http";

/** Composition root for the browser: real fetch transport + public exchange endpoints. */
export const exchangeSources = createExchangeSources(
  createFetchHttpClient({ timeoutMs: REQUEST_TIMEOUT_MS }),
  env,
);
