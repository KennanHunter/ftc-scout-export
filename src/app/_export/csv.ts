import { headersFor, projectRow } from "./project";
import type { FullRecord, SeasonKey } from "./types";

const q = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
};

const quoteRow = (values: Array<string | number | null | undefined>) =>
  values.map(q).join(",");

export const buildCSV = (season: SeasonKey, records: FullRecord[]): string => {
  const header = quoteRow([...headersFor(season)]);
  const rows = records.map((r) => quoteRow(projectRow(season, r)));
  return [header, ...rows].join("\n");
};
