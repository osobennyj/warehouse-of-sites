import { ReportGallery } from "@/widgets/report-gallery/ui/report-gallery";
import { getReportSummaries } from "@/shared/lib/reports";

export async function GalleryView() {
  const reports = await getReportSummaries();
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-50">Report gallery</h1>
        <p className="mt-2 text-zinc-400">
          Pre-generated due-diligence memos using live market data and a mock LLM (no API key).
        </p>
      </div>
      <ReportGallery reports={reports} />
    </main>
  );
}