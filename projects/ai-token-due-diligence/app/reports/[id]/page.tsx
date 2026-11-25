import { ReportDetailsView } from "@/views/report-details/ui/report-details-view";
import { listReportIds } from "@/shared/lib/reports";

export async function generateStaticParams() {
  const ids = await listReportIds();
  return ids.map((id) => ({ id }));
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetailsView id={id} />;
}