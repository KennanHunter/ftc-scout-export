"use client";

import { useState } from "react";
import { buildCSV2025 } from "./export/export-2025";
import { buildCSV2026 } from "./export/export-2026";
import type { BatchStats } from "./export/fetch-records";

const SEASONS = {
  "2026": { label: "2026-2027 BIOBUZZ", build: buildCSV2026 },
  "2025": { label: "2025-2026 DECODE", build: buildCSV2025 },
} as const;

type SeasonKey = keyof typeof SEASONS;

export default function Home() {
  const [totalTeams, setTotalTeams] = useState(6000);
  const [season, setSeason] = useState<SeasonKey>("2026");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRun, setLastRun] = useState<BatchStats | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(
    null
  );

  const handleDownload = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLastRun(null);
    setLastError(null);
    setPendingDownload(null);
    setProgress(null);
    try {
      const { stats, download } = await SEASONS[season].build(
        totalTeams,
        (completed, total) => setProgress({ completed, total })
      );
      setLastRun(stats);
      if (stats.errors > 0) setPendingDownload(() => download);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid items-center justify-items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            FTC Scout Export
          </h1>
          <p className="text-gray-600 text-sm">Download team rankings data</p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="season"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Season
          </label>
          <select
            id="season"
            value={season}
            onChange={(e) => setSeason(e.target.value as SeasonKey)}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.entries(SEASONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="totalTeams"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Total Number of Team-Event Combination Entries
          </label>
          <input
            id="totalTeams"
            type="number"
            value={totalTeams ? totalTeams : ""}
            onChange={(e) => setTotalTeams(Number(e.target.value))}
            disabled={isLoading}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            min="1"
            max="20000"
          />
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Each team-event combination counts as one entry. Example: 6,000
            teams × 3 events = 18,000 entries. Number increases throughout the
            season. Setting this higher than needed won&apos;t break anything but
            may slow down FTC Scout. Our query method bypasses their rate
            limiting, so please be considerate of their servers.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
        >
          {isLoading ? "Downloading..." : "Download Full Rankings"}
        </button>

        {isLoading && progress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                {progress.completed} / {progress.total} batches
              </span>
              <span>
                {Math.round((progress.completed / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-150"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {!isLoading && lastRun && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              lastRun.errors > 0
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {lastRun.errors > 0 ? (
              <>
                <div>
                  Completed with errors: {lastRun.successes} batch
                  {lastRun.successes === 1 ? "" : "es"} succeeded,{" "}
                  {lastRun.errors} failed. CSV is missing data from the failed
                  batches.
                </div>
                {pendingDownload && (
                  <button
                    onClick={() => {
                      pendingDownload();
                      setPendingDownload(null);
                    }}
                    className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Download partial CSV anyway
                  </button>
                )}
              </>
            ) : (
              <>
                Done. {lastRun.successes} batch
                {lastRun.successes === 1 ? "" : "es"} succeeded.
              </>
            )}
          </div>
        )}
        {!isLoading && lastError && (
          <div className="mt-4 rounded-lg p-3 text-sm bg-red-50 text-red-800 border border-red-200">
            Download failed: {lastError}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Programmed by{" "}
            <a
              href="https://github.com/kennanhunter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              Kennan Hunter
            </a>{" "}
            for{" "}
            <a
              href="https://funroboticsnetwork.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              FUN Robotics Network
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <a
              href="https://github.com/KennanHunter/ftc-scout-export"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
