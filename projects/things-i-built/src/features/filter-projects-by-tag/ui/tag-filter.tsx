"use client";

import type { ProjectTag } from "@/entities/project";
import { cn } from "@/shared/lib";

import { ALL_TAGS, type TagFilterValue } from "../model/filter";

interface TagFilterProps {
  tags: readonly ProjectTag[];
  value: TagFilterValue;
  counts: Record<TagFilterValue, number>;
  onChange: (tag: TagFilterValue) => void;
}

export function TagFilter({ tags, value, counts, onChange }: TagFilterProps) {
  const options: TagFilterValue[] = [ALL_TAGS, ...tags];

  return (
    <div role="group" aria-label="Filter projects by tag" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active
                ? "border-fg bg-fg text-bg"
                : "border-border bg-card/50 text-muted hover:border-fg/30 hover:text-fg",
            )}
          >
            {option === ALL_TAGS ? "All" : option}
            <span className={cn("font-mono text-xs", active ? "text-bg/70" : "text-muted/80")}>{counts[option]}</span>
          </button>
        );
      })}
    </div>
  );
}
