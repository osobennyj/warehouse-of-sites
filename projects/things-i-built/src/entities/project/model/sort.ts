import type { Project } from "./types";

/** Explicit `order` wins; ties fall back to the newest project first. */
export function sortProjects<T extends Pick<Project, "order" | "date">>(projects: readonly T[]): T[] {
  return [...projects].sort((a, b) => a.order - b.order || b.date.getTime() - a.date.getTime());
}
