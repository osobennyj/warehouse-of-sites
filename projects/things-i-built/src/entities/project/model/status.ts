import type { ProjectStatus } from "./types";

export const projectStatusMeta: Record<ProjectStatus, { label: string; tone: "success" | "info" | "warning" }> = {
  live: { label: "Live", tone: "success" },
  beta: { label: "Beta", tone: "info" },
  "in-progress": { label: "Building now", tone: "warning" },
};
