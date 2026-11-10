"use client";

import { useEffect, useState } from "react";
import { getLocalRecent } from "@/app/_lib/recentExports";
import { seasonLabel, seasonChipClass } from "@/app/_export/project";
import type { SeasonKey } from "@/app/_export/types";

type RecentEntry = {
  uuid: string;
  season: string;
  createdAt: number;
  totalRecords: number;
  source: "local" | "global" | "both";
};

const relativeTime = (ts: number) => {
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const MAX_SHOWN = 10;

export default function RecentExports() {
  const [items, setItems] = useState<RecentEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const local = getLocalRecent().map((e) => ({ ...e, source: "local" as const }));

    const merge = (global: RecentEntry[]) => {
      const byUuid = new Map<string, RecentEntry>();
      for (const e of local) byUuid.set(e.uuid, { ...e });
      for (const g of global) {
        const existing = byUuid.get(g.uuid);
        if (existing) {
          byUuid.set(g.uuid, {
            ...existing,
            createdAt: Math.max(existing.createdAt, g.createdAt),
            totalRecords: g.totalRecords ?? existing.totalRecords,
            source: "both",
          });
        } else {
          byUuid.set(g.uuid, g);
        }
      }
      return [...byUuid.values()]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_SHOWN);
    };

    (async () => {
      try {
        const res = await fetch("/api/export/recent", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as {
          recents: Array<Omit<RecentEntry, "source">>;
        };
        if (cancelled) return;
        const global = body.recents.map(
          (e) => ({ ...e, source: "global" as const } as RecentEntry)
        );
        setItems(merge(global));
      } catch {
        if (!cancelled) setItems(merge([]));
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated || items.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-200">
          Recent exports
        </h2>
        <span className="text-xs text-neutral-500">{items.length}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((e) => (
          <li
            key={e.uuid}
            className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-neutral-950/60"
          >
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                e.season === "2022" ||
                e.season === "2023" ||
                e.season === "2024" ||
                e.season === "2025" ||
                e.season === "2026"
                  ? seasonChipClass(e.season as SeasonKey)
                  : "bg-neutral-800 border border-neutral-700 text-neutral-300"
              }`}
              title={
                e.source === "local"
                  ? "From this browser"
                  : e.source === "global"
                  ? "Shared recent"
                  : "This browser + shared"
              }
            >
              {e.season === "2022" ||
              e.season === "2023" ||
              e.season === "2024" ||
              e.season === "2025" ||
              e.season === "2026"
                ? seasonLabel(e.season as SeasonKey)
                : e.season}
            </span>
            <a
              href={`/${e.uuid}/view`}
              className="flex-1 min-w-0 text-xs text-indigo-300 hover:text-indigo-200 truncate font-mono"
              title={e.uuid}
            >
              {e.uuid}
            </a>
            <span className="text-[11px] text-neutral-500 whitespace-nowrap tabular-nums">
              {e.totalRecords.toLocaleString()} rows
            </span>
            <span className="text-[11px] text-neutral-500 whitespace-nowrap w-16 text-right">
              {relativeTime(e.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
