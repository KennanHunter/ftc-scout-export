import ExcelJS from "exceljs";
import { headersFor, projectRow } from "./project";
import type { FullRecord, SeasonKey } from "./types";

export const buildXLSX = async (
  season: SeasonKey,
  records: FullRecord[]
): Promise<Blob> => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "FTC Scout Export";
  wb.created = new Date();
  const ws = wb.addWorksheet(`FTC ${season}`);

  const headers = [...headersFor(season)];
  const rows = records.map((r) => projectRow(season, r));

  const lastCol = String.fromCharCode(64 + headers.length);
  const ref = `A1:${lastCol}${rows.length + 1}`;

  ws.addTable({
    name: `Export${season}`,
    ref: "A1",
    headerRow: true,
    style: { theme: "TableStyleMedium2", showRowStripes: true },
    columns: headers.map((h) => ({ name: h, filterButton: true })),
    rows: rows.map((r) => r.map((cell) => (cell === "" ? null : cell))),
  });

  for (let i = 0; i < headers.length; i++) {
    ws.getColumn(i + 1).width = Math.min(
      40,
      Math.max(10, headers[i].length + 4)
    );
  }
  ws.getColumn(2).width = 32;

  void ref;

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
