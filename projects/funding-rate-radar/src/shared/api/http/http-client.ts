import type { z } from "zod";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

/** Transport abstraction: adapters depend on this interface, tests inject a fixture-backed fake. */
export interface HttpClient {
  get<S extends z.ZodType>(url: string, schema: S, options?: RequestOptions): Promise<z.output<S>>;
  post<S extends z.ZodType>(
    url: string,
    body: unknown,
    schema: S,
    options?: RequestOptions,
  ): Promise<z.output<S>>;
}

interface FetchHttpClientConfig {
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

export function createFetchHttpClient({ timeoutMs, fetchImpl = fetch }: FetchHttpClientConfig): HttpClient {
  async function request<S extends z.ZodType>(
    url: string,
    init: RequestInit,
    schema: S,
    { signal }: RequestOptions = {},
  ): Promise<z.output<S>> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let response: Response;
    try {
      response = await fetchImpl(url, { ...init, signal: combined });
    } catch (error) {
      const reason = timeout.aborted ? `timed out after ${timeoutMs}ms` : (error as Error).message;
      throw new HttpError(`Network error: ${reason}`, url);
    }
    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status}`, url, response.status);
    }

    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw new HttpError(`Unexpected response shape: ${parsed.error.issues[0]?.message ?? "invalid"}`, url);
    }
    return parsed.data;
  }

  return {
    get: (url, schema, options) => request(url, { method: "GET" }, schema, options),
    post: (url, body, schema, options) =>
      request(
        url,
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
        schema,
        options,
      ),
  };
}
