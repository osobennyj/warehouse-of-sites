import { isDemoSlug, projectDemoPath, type DemoSlug } from "@/shared/config/demos";

export function resolveProjectLiveHref(slug: string, live?: string): string | undefined {
  if (isDemoSlug(slug)) return projectDemoPath(slug as DemoSlug);
  return live;
}
