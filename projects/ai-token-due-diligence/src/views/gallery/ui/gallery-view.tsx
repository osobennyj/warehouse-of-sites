import { ReportGallery } from "@/widgets/report-gallery/ui/report-gallery";
import { getReportSummaries } from "@/shared/lib/reports";

export async function GalleryView() {
  const reports = await getReportSummaries();
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-50">Report gallery</h1>
        <p className="mt-2 text-zinc-400">
          Checklist scores are formulaic from live market adapters. Prose is mock unless you run with an LLM API key
          locally.
        </p>
      </div>
      <ReportGallery reports={reports} />
    </main>
  );
}