import type { Score } from "../model/schema";

const gradeTone: Record<Score["grade"], string> = {
  A: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  B: "bg-lime-500/15 text-lime-300 ring-lime-500/30",
  C: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  D: "bg-orange-500/15 text-orange-200 ring-orange-500/30",
  F: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
};

export function ReportScoreBadge({ score }: { score: Score }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${gradeTone[score.grade]}`}
    >
      <span className="font-semibold">Checklist {score.grade}</span>
      <span className="text-zinc-300">{score.total}/100</span>
    </span>
  );
}