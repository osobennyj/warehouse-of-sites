import { describe, expect, it } from "vitest";

import { projectFrontmatterSchema } from "./schema";

const valid = {
  title: "Test",
  tagline: "Problem to solution in one clear sentence for the portfolio card.",
  description: "A long enough description for SEO and social previews that explains the project in plain language.",
  status: "in-progress" as const,
  tags: ["Research" as const],
  stack: ["TypeScript", "Next.js"],
  date: "2026-11-25",
};

describe("projectFrontmatterSchema", () => {
  it("accepts valid frontmatter", () => {
    expect(projectFrontmatterSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects unknown keys", () => {
    const result = projectFrontmatterSchema.safeParse({ ...valid, extra: true });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tag", () => {
    const result = projectFrontmatterSchema.safeParse({ ...valid, tags: ["Bots"] });
    expect(result.success).toBe(true);
    const bad = projectFrontmatterSchema.safeParse({ ...valid, tags: ["Web3"] });
    expect(bad.success).toBe(false);
  });
});
