"use client";

import { memo, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { headersFor, projectRow, ftcScoutUrl } from "@/app/_export/project";

const firstEventsUrl = (teamNumber: number) =>
  `https://ftc-events.firstinspires.org/team/${teamNumber}`;

const TeamLinkIcons = memo(function TeamLinkIcons({
  teamNumber,
}: {
  teamNumber: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 mr-2 align-middle">
      <a
        href={ftcScoutUrl(teamNumber)}
        target="_blank"
        rel="noopener noreferrer"
        title="Open on ftcscout.org"
        className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ftcscout.png"
          alt=""
          width={16}
          height={16}
          loading="lazy"
          decoding="async"
        />
      </a>
      <a
        href={firstEventsUrl(teamNumber)}
        target="_blank"
        rel="noopener noreferrer"
        title="Open on ftc-events.firstinspires.org"
        className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-800 bg-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/first.png"
          alt=""
          width={16}
          height={10}
          loading="lazy"
          decoding="async"
        />
      </a>
    </span>
  );
});
import type { FullRecord, SeasonKey } from "@/app/_export/types";

type Row = Record<string, string | number>;

const buildColumns = (season: SeasonKey): ColumnDef<Row>[] => {
  const headers = [...headersFor(season)];
  return headers.map((h, i) => {
    const id = h;
    const isTeamNumber = i === 0;
    const isName = h === "name";
    const isFtcScout = h === "ftcScout";
    const isWebsite = h === "website";
    const isLocation = h === "location";
    const isEvent = h === "event";
    const isNumeric =
      !isTeamNumber &&
      !isName &&
      !isFtcScout &&
      !isWebsite &&
      !isLocation &&
      !isEvent;

    return {
      id,
      header: h,
      accessorKey: id,
      size: isName ? 320 : isFtcScout ? 120 : isLocation ? 180 : isEvent ? 220 : isWebsite ? 180 : isNumeric ? 96 : 120,
      sortingFn: isNumeric
        ? (a, b, colId) => {
            const av = a.getValue(colId);
            const bv = b.getValue(colId);
            const an = typeof av === "number" ? av : Number.NEGATIVE_INFINITY;
            const bn = typeof bv === "number" ? bv : Number.NEGATIVE_INFINITY;
            return an === bn ? 0 : an < bn ? -1 : 1;
          }
        : "alphanumeric",
      cell: ({ getValue, row }) => {
        const v = getValue() as string | number;
        if (isName) {
          const teamNum = row.getValue("teamnumber") as number;
          return (
            <span className="inline-flex items-center">
              <TeamLinkIcons teamNumber={teamNum} />
              <span>{v === "" ? <span className="text-gray-500">—</span> : v}</span>
            </span>
          );
        }
        if (isFtcScout) {
          const teamNum = row.getValue("teamnumber") as number;
          return (
            <a
              href={ftcScoutUrl(teamNum)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-indigo-200 underline"
            >
              Go to site
            </a>
          );
        }
        if (isWebsite && typeof v === "string" && v.length > 0) {
          const display = v.length > 60 ? v.slice(0, 59) + "…" : v;
          return (
            <a
              href={v}
              target="_blank"
              rel="noopener noreferrer"
              title={v}
              className="text-indigo-300 hover:text-indigo-200 underline"
            >
              {display}
            </a>
          );
        }
        if (isNumeric && typeof v === "number") {
          return (
            <span className="tabular-nums">
              {Number.isInteger(v) ? v : v.toFixed(2)}
            </span>
          );
        }
        return v === "" ? <span className="text-gray-500">—</span> : v;
      },
    };
  });
};

const buildRows = (season: SeasonKey, records: FullRecord[]): Row[] => {
  const headers = [...headersFor(season)];
  return records.map((r) => {
    const cells = projectRow(season, r);
    const obj: Row = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i];
    });
    return obj;
  });
};

export default function ExportTable({
  season,
  records,
}: {
  season: SeasonKey;
  records: FullRecord[];
}) {
  const data = useMemo(() => buildRows(season, records), [season, records]);
  const columns = useMemo(() => buildColumns(season), [season]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "oprTotalNp", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility: { ftcScout: false } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });

  return (
    <div className="overflow-auto h-full border border-neutral-800 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-neutral-900 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-neutral-800">
              {hg.headers.map((header) => {
                const sortDir = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-left px-3 py-2 font-medium text-neutral-200 whitespace-nowrap cursor-pointer select-none hover:bg-neutral-800"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span className="ml-1 text-neutral-500">
                      {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-neutral-900 hover:bg-neutral-900/60"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className="px-3 py-1.5 text-neutral-300 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-neutral-500 py-6"
              >
                waiting for rows…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
