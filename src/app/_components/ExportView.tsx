"use client";

import { useEffect, useRef, useState } from "react";
import ExportTable from "./ExportTable";
import { useExportStream } from "./useExportStream";
import { buildCSV } from "@/app/_export/csv";
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
      typeof window !== "undefined" &&
      window.location.search.includes("live=1")
    ) {
      window.history.replaceState(null, "", `/${state.uuid}/view`);
    }
  }, [mode, state.done, state.failedBatches.length, state.fatalError, state.uuid]);

  const canExport =
    state.done &&
    state.failedBatches.length === 0 &&
    !state.fatalError &&
    state.records.length > 0;

  const pct =
    state.total > 0
      ? Math.min(100, Math.round((state.completed / state.total) * 100))
      : 0;

  const disabledBtn =
    "w-full text-left px-3 py-2 rounded-md bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800";
  const activeBtn =
    "w-full text-left px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition-colors";

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
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-900/60">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold whitespace-nowrap">
              FTC Scout Export
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-900/60 border border-indigo-700 text-indigo-200 whitespace-nowrap">
              Season {season}
            </span>
            {state.uuid && (
              <span className="text-xs text-neutral-500 font-mono truncate min-w-0">
                {state.uuid}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 ml-auto whitespace-nowrap">
            {state.done ? (
              <>
                <span>{state.records.length} rows</span>
                {state.failedBatches.length > 0 && (
                  <>
                    <span className="text-amber-400">
                      {state.failedBatches.length} failed batch
                      {state.failedBatches.length === 1 ? "" : "es"}
                    </span>
                    <button
                      onClick={() => void retry()}
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      Retry failed batches
                    </button>
                  </>
                )}
              </>
            ) : (
              <span>
                {state.completed} / {state.total} batches ({pct}%)
              </span>
            )}
          </div>
        </div>
        {!state.done && (
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-[width] duration-150"
              style={{ width: `${pct}%` }}
            />
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
            Export
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
              onClick={() => void handleExportXlsx()}
              disabled={!canExport || busyExport !== null}
              title={canExport ? undefined : "Export available once the run completes"}
            >
              {busyExport === "xlsx" ? "Building…" : "Export as XLSX"}
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

        <main className="flex-1 min-w-0 p-3">
          <ExportTable season={season} records={state.records} />
        </main>
      </div>
    </div>
  );
}
