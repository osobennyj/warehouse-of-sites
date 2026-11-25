import type { z } from "zod";

import type { PROJECT_ACCENTS, PROJECT_STATUSES, PROJECT_TAGS, projectFrontmatterSchema } from "./schema";

export type ProjectTag = (typeof PROJECT_TAGS)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectAccent = (typeof PROJECT_ACCENTS)[number];

export type ProjectFrontmatter = z.output<typeof projectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  slug: string;
}

export interface ProjectCaseStudy {
  project: Project;
  html: string;
}
