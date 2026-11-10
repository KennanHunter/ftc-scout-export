"use client";

import { useEffect, useRef, useState } from "react";
import ExportView from "./ExportView";
import type { ExportPayload, SeasonKey } from "@/app/_export/types";

type Status =
  | { kind: "deciding" }
  | { kind: "live"; season: SeasonKey; totalTeams: number }
  | { kind: "loading-resume" }
  | { kind: "resume"; payload: ExportPayload }
  | { kind: "not-found" }
  | { kind: "error"; message: string };

export default function ExportViewLoader({ uuid }: { uuid: string }) {
  const [status, setStatus] = useState<Status>({ kind: "deciding" });
  const initialSearch = useRef<string | null>(null);

  useEffect(() => {
    if (initialSearch.current === null) {
      initialSearch.current = window.location.search;
    }
    const params = new URLSearchParams(initialSearch.current);
    const live = params.get("live");
    const seasonRaw = params.get("season");
    const totalRaw = params.get("totalTeams");

    if (live === "1" && seasonRaw && totalRaw) {
      const season: SeasonKey = seasonRaw === "2025" ? "2025" : "2026";
      const totalTeams = Math.max(1, Number(totalRaw) || 0);
      setStatus({ kind: "live", season, totalTeams });
      return;
    }

    let cancelled = false;
    setStatus({ kind: "loading-resume" });
    (async () => {
      try {
        const res = await fetch(`/api/export/${encodeURIComponent(uuid)}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 404) {
          setStatus({ kind: "not-found" });
          return;
        }
        if (!res.ok) {
          setStatus({ kind: "error", message: `HTTP ${res.status}` });
          return;
        }
        const payload = (await res.json()) as ExportPayload;
        if (cancelled) return;
        setStatus({ kind: "resume", payload });
      } catch (err) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  if (status.kind === "deciding" || status.kind === "loading-resume") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400 text-sm">
        Loading…
      </div>
    );
  }

  if (status.kind === "not-found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
        <div className="max-w-md p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
          <h1 className="text-xl font-semibold mb-2">Export not found</h1>
          <p className="text-sm text-neutral-400 mb-4">
            This export doesn&apos;t exist or has expired.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
        <div className="max-w-md p-6 bg-neutral-900 rounded-xl border border-neutral-800">
          <h1 className="text-xl font-semibold mb-2">Error loading export</h1>
          <p className="text-sm text-neutral-400 break-words">{status.message}</p>
        </div>
      </div>
    );
  }

  if (status.kind === "live") {
    return (
      <ExportView
        mode="live"
        season={status.season}
        uuid={uuid}
        totalTeams={status.totalTeams}
      />
    );
  }

  return (
    <ExportView
      mode="resume"
      season={status.payload.season}
      uuid={status.payload.uuid}
      seedRecords={status.payload.records}
    />
  );
}
