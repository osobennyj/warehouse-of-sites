import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createFetchHttpClient, HttpError } from "./http-client";

const schema = z.object({ value: z.number() });
const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("fetch http client", () => {
  it("returns schema-validated JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ value: 42 }));
    const http = createFetchHttpClient({ timeoutMs: 1000, fetchImpl });

    await expect(http.get("https://api.test/x", schema)).resolves.toEqual({ value: 42 });
  });

  it("sends JSON bodies for POST requests", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ value: 1 }));
    const http = createFetchHttpClient({ timeoutMs: 1000, fetchImpl });

    await http.post("https://api.test/info", { type: "meta" }, schema);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.test/info",
      expect.objectContaining({ method: "POST", body: '{"type":"meta"}' }),
    );
  });

  it("raises HttpError with status for non-2xx responses", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 451));
    const http = createFetchHttpClient({ timeoutMs: 1000, fetchImpl });

    await expect(http.get("https://api.test/x", schema)).rejects.toMatchObject({
      name: "HttpError",
      status: 451,
    });
  });

  it("raises HttpError when the payload does not match the schema", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ value: "nope" }));
    const http = createFetchHttpClient({ timeoutMs: 1000, fetchImpl });

    await expect(http.get("https://api.test/x", schema)).rejects.toThrow(/Unexpected response shape/);
  });

  it("wraps network failures", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const http = createFetchHttpClient({ timeoutMs: 1000, fetchImpl });

    await expect(http.get("https://api.test/x", schema)).rejects.toBeInstanceOf(HttpError);
  });
});
