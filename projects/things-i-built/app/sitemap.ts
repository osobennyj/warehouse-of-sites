import type { MetadataRoute } from "next";

import { getProjects } from "@/entities/project/server";

export const dynamic = "force-static";
import { getResearchNoteSlugs } from "@/entities/research-note/server";
import { siteConfig } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const staticRoutes = ["", "projects/", "research/"].map((path) => ({
    url: `${base}/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectRoutes = getProjects().map((project) => ({
    url: `${base}/projects/${project.slug}/`,
    lastModified: project.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const researchRoutes = getResearchNoteSlugs().map((slug) => ({
    url: `${base}/research/${slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...researchRoutes];
}