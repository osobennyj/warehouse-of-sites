import { readCollection, renderMarkdown } from "@/shared/lib/content";

import { projectFrontmatterSchema } from "../model/schema";
import { sortProjects } from "../model/sort";
import type { Project, ProjectCaseStudy } from "../model/types";

function loadEntries() {
  return readCollection("projects", projectFrontmatterSchema);
}

export function getProjects(): Project[] {
  return sortProjects(loadEntries().map(({ slug, data }) => ({ slug, ...data })));
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((project) => project.featured);
}

export async function getProjectCaseStudy(slug: string): Promise<ProjectCaseStudy | null> {
  const entry = loadEntries().find((item) => item.slug === slug);
  if (!entry) return null;
  return { project: { slug, ...entry.data }, html: await renderMarkdown(entry.body) };
}
