"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProjectTag } from "@/entities/project";

import { ALL_TAGS, parseTag, type TagFilterValue } from "./filter";

const PARAM = "tag";

/** Keeps the selected tag in `?tag=` so filtered views are shareable (works with static export, no server needed). */
export function useTagFilter(available: readonly ProjectTag[]) {
  const [tag, setTag] = useState<TagFilterValue>(ALL_TAGS);

  useEffect(() => {
    const sync = () => setTag(parseTag(new URLSearchParams(window.location.search).get(PARAM), available));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [available]);

  const select = useCallback((next: TagFilterValue) => {
    setTag(next);
    const url = new URL(window.location.href);
    if (next === ALL_TAGS) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next.toLowerCase());
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return { tag, select };
}
