import { notFound } from "next/navigation";
import { ReportView } from "@/entities/report/ui/report-view";
import { getReportById } from "@/shared/lib/reports";

export async function ReportDetailsView({ id }: { id: string }) {
  const report = await getReportById(id);
  if (!report) notFound();
  return <ReportView report={report} />;
}