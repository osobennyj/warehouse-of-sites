import type { z } from "zod";

export interface HttpClient {
  getJson<T>(url: string, schema: z.ZodType<T>, init?: { headers?: Record<string, string> }): Promise<T>;
  getText(url: string): Promise<string>;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`HTTP ${status} for ${redact(url)}`);
    this.name = "HttpError";
  }
}

export class ResponseValidationError extends Error {
  constructor(url: string, issues: string) {
    super(`Unexpected response shape from ${redact(url)}: ${issues}`);
    this.name = "ResponseValidationError";
  }
}

interface FetchHttpClientOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  userAgent?: string;
}

export function createFetchHttpClient({
  fetchImpl = fetch,
  timeoutMs = 12_000,
  userAgent = "ai-token-due-diligence/1.0",
}: FetchHttpClientOptions = {}): HttpClient {
  const request = async (url: string, headers: Record<string, string>) => {
    const response = await fetchImpl(url, {
      headers: { "user-agent": userAgent, ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new HttpError(response.status, url);
    return response;
  };

  return {
    async getJson(url, schema, init) {
      const response = await request(url, { accept: "application/json", ...init?.headers });
      const parsed = schema.safeParse(await response.json());
      if (!parsed.success) throw new ResponseValidationError(url, parsed.error.message);
      return parsed.data;
    },
    async getText(url) {
      const response = await request(url, {});
      return response.text();
    },
  };
}

/** Memoises successful responses per URL for `ttlMs` — keeps us inside free-tier rate limits. */
export function withTtlCache(client: HttpClient, ttlMs: number, now = () => Date.now()): HttpClient {
  const cache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

  const cached = <T>(key: string, load: () => Promise<T>): Promise<T> => {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now()) return hit.value as Promise<T>;
    const value = load();
    cache.set(key, { expiresAt: now() + ttlMs, value });
    value.catch(() => cache.delete(key));
    return value;
  };

  return {
    getJson: (url, schema, init) => cached(`json:${url}`, () => client.getJson(url, schema, init)),
    getText: (url) => cached(`text:${url}`, () => client.getText(url)),
  };
}

const redact = (url: string) => url.replace(/(apiKey|api_key|key)=[^&]+/gi, "$1=***");
