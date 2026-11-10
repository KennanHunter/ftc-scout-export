"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import ExportTable from "./ExportTable";
import ColumnsMenu from "./ColumnsMenu";
import { useExportStream } from "./useExportStream";
import { buildCSV } from "@/app/_export/csv";
import { headersFor, seasonLabel } from "@/app/_export/project";
import { addLocalRecent } from "@/app/_lib/recentExports";
import type { FullRecord, SeasonKey } from "@/app/_export/types";

const tsStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}@${pad(
    d.getHours()
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export type ExportViewProps = {
  mode: "live" | "resume";
  season: SeasonKey;
  uuid?: string;
  totalTeams?: number;
  seedRecords?: FullRecord[];
};

function ImportDataSnippet({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const formula = `=IMPORTDATA("${origin}/api/export/${uuid}/csv")`;
  return (
    <div className="flex flex-col gap-1">
      <code className="block text-[11px] font-mono bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-neutral-300 break-all">
        {formula}
      </code>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(formula);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {}
        }}
        className="self-start text-xs text-indigo-300 hover:text-indigo-200 underline"
      >
        {copied ? "Copied!" : "Copy formula"}
      </button>
    </div>
  );
}

function CopyUrlIconButton({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy share URL"
      title={copied ? "Copied!" : "Copy share URL"}
      onClick={async () => {
        try {
          const url = `${window.location.origin}/${uuid}/view`;
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-800 transition-colors ${
        copied ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-200"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"
        />
        <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z" />
      </svg>
    </button>
  );
}

function ShareLinkButton({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}/${uuid}/view`);
  }, [uuid]);
  return (
    <div className="flex flex-col gap-1">
      <code className="block text-[11px] font-mono bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-neutral-300 break-all">
        {url}
      </code>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {}
        }}
        className="self-start text-xs text-indigo-300 hover:text-indigo-200 underline"
      >
        {copied ? "Copied!" : "Copy share link"}
      </button>
    </div>
  );
}

export default function ExportView({
  mode,
  season,
  uuid,
  totalTeams,
  seedRecords,
}: ExportViewProps) {
  const { state, start, retry } = useExportStream({
    season,
    uuid: uuid ?? null,
    seedRecords,
    seedDone: mode === "resume",
    totalBatchesHint: 0,
  });
  const started = useRef(false);
  const [copied, setCopied] = useState(false);
  const [busyExport, setBusyExport] = useState<
    null | "csv" | "xlsx" | "copy" | "json"
  >(null);
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("q", search);
    else params.delete("q");
    const query = params.toString();
    const url =
      window.location.pathname +
      (query ? `?${query}` : "") +
      window.location.hash;
    window.history.replaceState(window.history.state, "", url);
  }, [search]);

  const allHeaders = useMemo(() => headersFor(season), [season]);
  const visibilityStorageKey = `ftcse:columnVisibility:${season}`;
  const defaultVisibility = useMemo<VisibilityState>(
    () => ({ ftcScout: false }),
    []
  );
  const [columnVisibility, setColumnVisibilityState] =
    useState<VisibilityState>(defaultVisibility);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(visibilityStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as VisibilityState;
        setColumnVisibilityState({ ...defaultVisibility, ...parsed });
      } else {
        setColumnVisibilityState(defaultVisibility);
      }
    } catch {}
  }, [visibilityStorageKey, defaultVisibility]);

  const setColumnVisibility = useCallback(
    (next: VisibilityState) => {
      setColumnVisibilityState(next);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(visibilityStorageKey, JSON.stringify(next));
        } catch {}
      }
    },
    [visibilityStorageKey]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mode === "live" && !started.current && totalTeams && uuid) {
      started.current = true;
      void start({ season, totalTeams, uuid });
    }
  }, [mode, start, season, totalTeams, uuid]);

  useEffect(() => {
    if (
      mode === "live" &&
      state.done &&
      state.failedBatches.length === 0 &&
      !state.fatalError &&
      state.uuid &&
      typeof window !== "undefined"
    ) {
      if (window.location.search.includes("live=1")) {
        window.history.replaceState(null, "", `/${state.uuid}/view`);
      }
      addLocalRecent({
        uuid: state.uuid,
        season,
        createdAt: Date.now(),
        totalRecords: state.records.length,
      });
    }
  }, [
    mode,
    season,
    state.done,
    state.failedBatches.length,
    state.fatalError,
    state.uuid,
    state.records.length,
  ]);

  const canExport =
    state.done &&
    state.failedBatches.length === 0 &&
    !state.fatalError &&
    state.records.length > 0;

  const matchedCount = useMemo(() => {
    if (!search) return state.records.length;
    const needle = search.toLowerCase();
    return state.records.filter((r) => {
      const name = (r.team?.name ?? "").toLowerCase();
      const event = (r.eventName ?? "").toLowerCase();
      const num = String(r.teamNumber);
      return num.includes(needle) || name.includes(needle) || event.includes(needle);
    }).length;
  }, [search, state.records]);

  const pct =
    state.total > 0
      ? Math.min(100, Math.round((state.completed / state.total) * 100))
      : 0;

  const disabledBtn =
    "w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800";
  const activeBtn =
    "w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-colors";

  const handleExportCsv = () => {
    if (!canExport) return;
    setBusyExport("csv");
    try {
      const csv = buildCSV(season, state.records);
      downloadBlob(
        new Blob([csv], { type: "text/csv" }),
        `ftc-export-${season}-${tsStamp()}.csv`
      );
    } finally {
      setBusyExport(null);
    }
  };

  const handleExportXlsx = async () => {
    if (!canExport) return;
    setBusyExport("xlsx");
    try {
      const { buildXLSX } = await import("@/app/_export/xlsx");
      const blob = await buildXLSX(season, state.records);
      downloadBlob(blob, `ftc-export-${season}-${tsStamp()}.xlsx`);
    } finally {
      setBusyExport(null);
    }
  };

  const handleExportJson = () => {
    if (!canExport) return;
    setBusyExport("json");
    try {
      const payload = {
        uuid: state.uuid,
        season,
        createdAt: Date.now(),
        totalRecords: state.records.length,
        records: state.records,
      };
      downloadBlob(
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        }),
        `ftc-export-${season}-${tsStamp()}.json`
      );
    } finally {
      setBusyExport(null);
    }
  };

  const handleCopyCsv = async () => {
    if (!canExport) return;
    setBusyExport("copy");
    try {
      const csv = buildCSV(season, state.records);
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } finally {
      setBusyExport(null);
    }
  };

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col overflow-hidden">
      <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-900/60">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-2">
          <div className="flex items-baseline gap-3 min-w-0">
            <a
              href="/"
              className="text-lg font-semibold whitespace-nowrap leading-none hover:text-indigo-300"
            >
              FTC Scout Export
            </a>
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-900/60 border border-indigo-700 text-indigo-200 whitespace-nowrap leading-none">
              {seasonLabel(season)}
            </span>
            {state.uuid && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <span className="text-xs text-neutral-500 font-mono truncate leading-none">
                  {state.uuid}
                </span>
                <CopyUrlIconButton uuid={state.uuid} />
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 ml-auto">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team, number, event… (press /)"
              className="h-7 px-2 w-64 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <ColumnsMenu
              headers={allHeaders}
              visibility={columnVisibility}
              labelFor={(h) => (h === "teamnumber" ? "number" : h)}
              onToggle={(h, v) =>
                setColumnVisibility({ ...columnVisibility, [h]: v })
              }
              onAll={(v) =>
                setColumnVisibility(
                  Object.fromEntries(allHeaders.map((h) => [h, v]))
                )
              }
            />
            {state.done && state.failedBatches.length > 0 && (
              <>
                <span className="text-amber-400 whitespace-nowrap">
                  {state.failedBatches.length} failed
                </span>
                <button
                  onClick={() => void retry()}
                  className="h-7 px-2 rounded bg-amber-600 hover:bg-amber-500 text-white whitespace-nowrap"
                >
                  Retry
                </button>
              </>
            )}
            <div className="w-28 text-right tabular-nums whitespace-nowrap">
              {state.done ? (
                search ? (
                  <>
                    {matchedCount.toLocaleString()} /{" "}
                    {state.records.length.toLocaleString()} rows
                  </>
                ) : (
                  <>{state.records.length.toLocaleString()} rows</>
                )
              ) : state.phase?.phase === "teamMap" ? (
                state.phase.label
              ) : (
                <>
                  {state.completed} / {state.total} batches ({pct}%)
                </>
              )}
            </div>
          </div>
        </div>
        {!state.done && (
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden relative">
            {state.phase?.phase === "teamMap" || state.total === 0 ? (
              <div className="absolute inset-y-0 w-1/3 bg-indigo-500/80 rounded-full animate-[indeterminate_1.2s_ease-in-out_infinite]" />
            ) : (
              <div
                className="h-full bg-indigo-500 transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            )}
          </div>
        )}
        {state.fatalError && (
          <div className="mt-2 text-sm text-red-400">
            Error: {state.fatalError}
          </div>
        )}
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-56 shrink-0 border-r border-neutral-800 p-3 bg-neutral-950">
          <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
            Spreadsheet
          </div>
          <button
            className={canExport ? activeBtn : disabledBtn}
            onClick={() => void handleExportXlsx()}
            disabled={!canExport || busyExport !== null}
            title={canExport ? undefined : "Export available once the run completes"}
          >
            {busyExport === "xlsx" ? "Building…" : "Export as XLSX"}
          </button>
          <p className="mt-1.5 text-[11px] text-neutral-500 leading-snug">
            Prefer for Excel or Google Sheets.
          </p>

          <div className="text-xs uppercase tracking-wider text-neutral-500 mt-5 mb-2">
            Other exports
          </div>
          <div className="flex flex-col gap-2">
            <button
              className={canExport ? activeBtn : disabledBtn}
              onClick={handleExportCsv}
              disabled={!canExport || busyExport !== null}
              title={canExport ? undefined : "Export available once the run completes"}
            >
              {busyExport === "csv" ? "Exporting…" : "Export as CSV"}
            </button>
            <button
              className={canExport ? activeBtn : disabledBtn}
              onClick={() => void handleCopyCsv()}
              disabled={!canExport || busyExport !== null}
              title={canExport ? undefined : "Export available once the run completes"}
            >
              {copied ? "Copied!" : busyExport === "copy" ? "Copying…" : "Copy CSV"}
            </button>
            <button
              className={canExport ? activeBtn : disabledBtn}
              onClick={handleExportJson}
              disabled={!canExport || busyExport !== null}
              title={canExport ? undefined : "Export available once the run completes"}
            >
              {busyExport === "json" ? "Exporting…" : "Download raw JSON"}
            </button>
          </div>
          {!canExport && !state.fatalError && (
            <p className="mt-3 text-xs text-neutral-500 leading-snug">
              Exports unlock after all batches complete.
            </p>
          )}

          {canExport && state.uuid && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Google Sheets
              </div>
              <p className="text-xs text-neutral-400 leading-snug mb-2">
                Paste this into a cell to pull the CSV live:
              </p>
              <ImportDataSnippet uuid={state.uuid} />
            </div>
          )}

          {canExport && state.uuid && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Share
              </div>
              <ShareLinkButton uuid={state.uuid} />
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <ExportTable
            season={season}
            records={state.records}
            globalFilter={search}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        </main>
      </div>
    </div>
  );
}
