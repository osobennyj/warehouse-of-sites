import { PROJECT_TAGS, type Project, type ProjectTag } from "@/entities/project";

export const ALL_TAGS = "all";
export type TagFilterValue = ProjectTag | typeof ALL_TAGS;

type Taggable = Pick<Project, "tags">;

/** Only tags that are actually used, in the canonical order defined by the schema. */
export function getAvailableTags(projects: readonly Taggable[]): ProjectTag[] {
  const used = new Set(projects.flatMap((project) => project.tags));
  return PROJECT_TAGS.filter((tag) => used.has(tag));
}

export function filterProjectsByTag<T extends Taggable>(projects: readonly T[], tag: TagFilterValue): T[] {
  return tag === ALL_TAGS ? [...projects] : projects.filter((project) => project.tags.includes(tag));
}

export function countByTag(projects: readonly Taggable[], tag: TagFilterValue): number {
  return filterProjectsByTag(projects, tag).length;
}

/** Case-insensitive so shared links like `?tag=ai` keep working; unknown values fall back to "all". */
export function parseTag(raw: string | null | undefined, available: readonly ProjectTag[]): TagFilterValue {
  if (!raw) return ALL_TAGS;
  return available.find((tag) => tag.toLowerCase() === raw.toLowerCase()) ?? ALL_TAGS;
}
