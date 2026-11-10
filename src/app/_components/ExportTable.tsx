"use client";

import { memo, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { headersFor, projectRow, ftcScoutUrl } from "@/app/_export/project";
import type { FullRecord, SeasonKey } from "@/app/_export/types";

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

type RowShape = Record<string, string | number>;

const TEAMNUM_WIDTH = 64;

const revealOverlayClass =
  "pointer-events-none invisible group-hover/cell:visible " +
  "absolute top-0 left-0 z-10 " +
  "w-max min-w-full max-w-[640px] " +
  "px-[inherit] py-[inherit] " +
  "bg-neutral-900 text-neutral-200 " +
  "shadow-lg rounded-sm ring-1 ring-neutral-700 " +
  "flex items-center";

const buildColumns = (season: SeasonKey): ColumnDef<RowShape>[] => {
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
      header: isTeamNumber ? "number" : h,
      accessorKey: id,
      size: isName
        ? 200
        : isTeamNumber
        ? TEAMNUM_WIDTH
        : isFtcScout
        ? 120
        : isLocation
        ? 180
        : isEvent
        ? 220
        : isWebsite
        ? 280
        : isNumeric
        ? Math.max(80, Math.min(200, h.length * 8 + 32))
        : 120,
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
          const name = typeof v === "string" ? v : String(v);
          return (
            <>
              <span
                className="flex items-center min-w-0 truncate"
                title={name}
              >
                <TeamLinkIcons teamNumber={teamNum} />
                {name === "" ? (
                  <span className="text-gray-500">-</span>
                ) : (
                  <span className="truncate">{name}</span>
                )}
              </span>
              <span aria-hidden="true" className={revealOverlayClass}>
                <TeamLinkIcons teamNumber={teamNum} />
                {name === "" ? (
                  <span className="text-gray-500">-</span>
                ) : (
                  <span>{name}</span>
                )}
              </span>
            </>
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
          return (
            <>
              <a
                href={v}
                target="_blank"
                rel="noopener noreferrer"
                title={v}
                className="block truncate text-indigo-300 hover:text-indigo-200 underline"
              >
                {v}
              </a>
              <span aria-hidden="true" className={revealOverlayClass}>
                <span className="text-indigo-300 underline">{v}</span>
              </span>
            </>
          );
        }
        if (isNumeric && typeof v === "number") {
          return (
            <span className="tabular-nums">
              {Number.isInteger(v) ? v : v.toFixed(2)}
            </span>
          );
        }
        if ((isEvent || isLocation) && typeof v === "string" && v.length > 0) {
          return (
            <>
              <span className="block truncate" title={v}>
                {v}
              </span>
              <span aria-hidden="true" className={revealOverlayClass}>
                {v}
              </span>
            </>
          );
        }
        return v === "" ? <span className="text-gray-500">-</span> : v;
      },
    };
  });
};

const buildRows = (season: SeasonKey, records: FullRecord[]): RowShape[] => {
  const headers = [...headersFor(season)];
  return records.map((r) => {
    const cells = projectRow(season, r);
    const obj: RowShape = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i];
    });
    return obj;
  });
};

const globalFilterFn = (row: Row<RowShape>, _col: string, q: string) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  const teamNum = String(row.getValue("teamnumber") ?? "");
  const name = String(row.getValue("name") ?? "").toLowerCase();
  const event = String(row.getValue("event") ?? "").toLowerCase();
  return (
    teamNum.includes(needle) || name.includes(needle) || event.includes(needle)
  );
};

export type ExportTableProps = {
  season: SeasonKey;
  records: FullRecord[];
  globalFilter?: string;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange?: (next: VisibilityState) => void;
};

export default function ExportTable({
  season,
  records,
  globalFilter = "",
  columnVisibility,
  onColumnVisibilityChange,
}: ExportTableProps) {
  const data = useMemo(() => buildRows(season, records), [season, records]);
  const columns = useMemo(() => buildColumns(season), [season]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "oprTotalNp", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      if (!onColumnVisibilityChange) return;
      const next =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      onColumnVisibilityChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn,
    columnResizeMode: "onChange",
  });

  const rows = table.getRowModel().rows;
  const visibleColumnsWidth = table
    .getVisibleLeafColumns()
    .reduce((sum, c) => sum + c.getSize(), 0);
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 12,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  const stickyBaseTd =
    "sticky z-10 bg-neutral-950 group-hover:bg-neutral-900";
  const stickyBaseTh = "sticky z-30 bg-neutral-900";

  return (
    <div
      ref={parentRef}
      className="overflow-auto h-full border-t border-neutral-800"
    >
      <table
        className="text-sm border-separate border-spacing-0 table-fixed"
        style={{ width: visibleColumnsWidth }}
      >
        <colgroup>
          {table.getVisibleLeafColumns().map((c) => (
            <col key={c.id} style={{ width: c.getSize() }} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-20 bg-neutral-900">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const sortDir = header.column.getIsSorted();
                const id = header.column.id;
                const isTeamNum = id === "teamnumber";
                const isName = id === "name";
                const stickyClass = isTeamNum
                  ? `${stickyBaseTh} left-0`
                  : isName
                  ? `${stickyBaseTh}`
                  : "";
                const stickyStyle = isName ? { left: TEAMNUM_WIDTH } : undefined;
                const padX = isName
                  ? "px-0.5"
                  : isTeamNum
                  ? "px-1.5"
                  : "px-3";
                const borderR = isName ? "border-r border-r-neutral-700" : "";
                return (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), ...stickyStyle }}
                    className={`text-left ${padX} py-2 font-medium text-neutral-200 whitespace-nowrap cursor-pointer select-none hover:bg-neutral-800 border-b border-b-neutral-700 ${borderR} ${stickyClass}`}
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
          {paddingTop > 0 && (
            <tr aria-hidden="true">
              <td colSpan={table.getVisibleLeafColumns().length} style={{ height: paddingTop }} />
            </tr>
          )}
          {virtualRows.map((v) => {
            const row = rows[v.index];
            return (
              <tr
                key={row.id}
                data-index={v.index}
                ref={rowVirtualizer.measureElement}
                className="group"
              >
                {row.getVisibleCells().map((cell) => {
                  const id = cell.column.id;
                  const isTeamNum = id === "teamnumber";
                  const isName = id === "name";
                  const stickyClass = isTeamNum
                    ? `${stickyBaseTd} left-0`
                    : isName
                    ? stickyBaseTd
                    : "";
                  const stickyStyle = isName
                    ? { left: TEAMNUM_WIDTH }
                    : undefined;
                  const padX = isName
                    ? "px-0.5"
                    : isTeamNum
                    ? "px-1.5"
                    : "px-3";
                  const borderR = isName ? "border-r border-r-neutral-700" : "";
                  const isReveal =
                    isName ||
                    id === "website" ||
                    id === "event" ||
                    id === "location";
                  const revealClass = isReveal
                    ? `group/cell relative hover:overflow-visible ${
                        isName ? "hover:z-40" : "hover:z-20"
                      }`
                    : "";
                  return (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize(), ...stickyStyle }}
                      className={`${padX} py-1.5 border-b border-b-neutral-900 text-neutral-300 whitespace-nowrap overflow-hidden text-ellipsis group-hover:bg-neutral-900 ${borderR} ${stickyClass} ${revealClass}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden="true">
              <td colSpan={table.getVisibleLeafColumns().length} style={{ height: paddingBottom }} />
            </tr>
          )}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={table.getVisibleLeafColumns().length}
                className="text-center text-neutral-500 py-6"
              >
                {globalFilter ? "no rows match your search" : "waiting for rows…"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
