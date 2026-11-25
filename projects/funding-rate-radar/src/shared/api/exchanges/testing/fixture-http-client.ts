import type { z } from "zod";
import type { HttpClient } from "../../http";

export interface FixtureRoute {
  /** Substring of the URL (GET) or a request body discriminator (POST `type`). */
  match: string;
  payload: unknown;
}

export interface RecordedRequest {
  method: "GET" | "POST";
  url: string;
  body?: unknown;
}

/** HttpClient fake that replays recorded fixtures and validates them with the adapter's own schema. */
export function createFixtureHttpClient(routes: FixtureRoute[]) {
  const requests: RecordedRequest[] = [];

  const resolve = <S extends z.ZodType>(key: string, schema: S): z.output<S> => {
    const route = routes.find((candidate) => key.includes(candidate.match));
    if (!route) throw new Error(`No fixture for ${key}`);
    return schema.parse(route.payload);
  };

  const client: HttpClient = {
    async get(url, schema) {
      requests.push({ method: "GET", url });
      return resolve(url, schema);
    },
    async post(url, body, schema) {
      requests.push({ method: "POST", url, body });
      const type = (body as { type?: string }).type ?? "";
      return resolve(`${url}#${type}`, schema);
    },
  };

  return { client, requests };
}
