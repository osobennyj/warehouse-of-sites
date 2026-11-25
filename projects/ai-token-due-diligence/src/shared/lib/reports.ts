import { readFile } from "node:fs/promises";
import path from "node:path";
import { ReportSchema, type Report, type ReportSummary, toReportSummary } from "@/entities/report";

const DATA_DIR = path.join(process.cwd(), "data", "reports");

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const raw = await readFile(path.join(DATA_DIR, `${id}.json`), "utf8");
    return ReportSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getAllReports(): Promise<Report[]> {
  const { readdir } = await import("node:fs/promises");
  try {
    const files = await readdir(DATA_DIR);
    const reports = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (file) => {
          const raw = await readFile(path.join(DATA_DIR, file), "utf8");
          return ReportSchema.parse(JSON.parse(raw));
        }),
    );
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getReportSummaries(): Promise<ReportSummary[]> {
  return (await getAllReports()).map(toReportSummary);
}

export async function listReportIds(): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  try {
    return (await readdir(DATA_DIR))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}