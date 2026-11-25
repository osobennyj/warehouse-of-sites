import { Badge } from "@/shared/ui";

import { projectStatusMeta } from "../model/status";
import type { ProjectStatus } from "../model/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label, tone } = projectStatusMeta[status];
  return (
    <Badge tone={tone} dot={status !== "in-progress"}>
      {label}
    </Badge>
  );
}
