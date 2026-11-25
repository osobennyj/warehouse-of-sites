"use client";

import { useMemo } from "react";

import { type Project, ProjectCard } from "@/entities/project";
import {
  ALL_TAGS,
  countByTag,
  filterProjectsByTag,
  getAvailableTags,
  TagFilter,
  type TagFilterValue,
  useTagFilter,
} from "@/features/filter-projects-by-tag";

export function ProjectsCatalog({ projects }: { projects: readonly Project[] }) {
  const tags = useMemo(() => getAvailableTags(projects), [projects]);
  const { tag, select } = useTagFilter(tags);
  const visible = filterProjectsByTag(projects, tag);
  const filterOptions: TagFilterValue[] = [ALL_TAGS, ...tags];
  const counts = Object.fromEntries(
    filterOptions.map((option) => [option, countByTag(projects, option)]),
  ) as Record<TagFilterValue, number>;

  return (
    <div className="space-y-8">
      <TagFilter tags={tags} value={tag} counts={counts} onChange={select} />
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>
      <ul className="grid gap-6 md:grid-cols-2" data-testid="projects-list">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
