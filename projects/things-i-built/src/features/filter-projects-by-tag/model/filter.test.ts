import { describe, expect, it } from "vitest";

import type { Project } from "@/entities/project";

import { ALL_TAGS, filterProjectsByTag, getAvailableTags, parseTag } from "./filter";

const projects: Project[] = [
  {
    slug: "a",
    title: "A",
    tagline: "tag",
    description: "desc",
    status: "in-progress",
    tags: ["Research"],
    stack: ["x", "y"],
    role: "r",
    links: {},
    accent: "teal",
    featured: true,
    order: 1,
    date: new Date(),
  },
  {
    slug: "b",
    title: "B",
    tagline: "tag",
    description: "desc",
    status: "in-progress",
    tags: ["AI", "DeFi"],
    stack: ["x", "y"],
    role: "r",
    links: {},
    accent: "violet",
    featured: true,
    order: 2,
    date: new Date(),
  },
];

describe("filterProjectsByTag", () => {
  it("returns all when filter is ALL", () => {
    expect(filterProjectsByTag(projects, ALL_TAGS)).toHaveLength(2);
  });

  it("filters by tag", () => {
    expect(filterProjectsByTag(projects, "AI")).toHaveLength(1);
    expect(filterProjectsByTag(projects, "AI")[0]?.slug).toBe("b");
  });

  it("lists only tags in use", () => {
    expect(getAvailableTags(projects)).toEqual(["Research", "AI", "DeFi"]);
  });

  it("parses tag from query case-insensitively", () => {
    expect(parseTag("ai", getAvailableTags(projects))).toBe("AI");
    expect(parseTag("unknown", getAvailableTags(projects))).toBe(ALL_TAGS);
  });
});
