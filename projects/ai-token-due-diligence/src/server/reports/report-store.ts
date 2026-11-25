import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ReportSchema, type Report, type ReportSummary, toReportSummary } from "@/entities/report";

const DATA_DIR = path.join(process.cwd(), "data", "reports");

export async function loadReport(id: string): Promise<Report | null> {
  try {
    const raw = await readFile(path.join(DATA_DIR, `${id}.json`), "utf8");
    return ReportSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveReport(report: Report): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, `${report.id}.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
}

export async function listReportSummaries(): Promise<ReportSummary[]> {
  try {
    const files = await readdir(DATA_DIR);
    const reports = await Promise.all(
      files.filter((f) => f.endsWith(".json")).map(async (file) => {
        const raw = await readFile(path.join(DATA_DIR, file), "utf8");
        return ReportSchema.parse(JSON.parse(raw));
      }),
    );
    return reports
      .map(toReportSummary)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function reportDataDir(): string {
  return DATA_DIR;
}