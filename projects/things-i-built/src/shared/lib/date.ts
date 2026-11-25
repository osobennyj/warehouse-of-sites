const formatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatMonthYear(date: Date): string {
  return formatter.format(date);
}
