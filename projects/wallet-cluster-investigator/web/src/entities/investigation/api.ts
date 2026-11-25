import { parseInvestigation } from "./model";
import type { Investigation } from "./schema";

const base = import.meta.env.BASE_URL;

export async function loadInvestigation(slug: string): Promise<Investigation> {
  const res = await fetch(`${base}investigations/${slug}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load investigation (${res.status})`);
  }
  const json: unknown = await res.json();
  return parseInvestigation(json);
}