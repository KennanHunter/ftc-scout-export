import type { SeasonKey } from "@/app/_export/types";

export type LocalRecentExport = {
  uuid: string;
  season: SeasonKey;
  createdAt: number;
  totalRecords: number;
};

const KEY = "ftcse:recent";
const MAX = 20;

const read = (): LocalRecentExport[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is LocalRecentExport =>
        !!e &&
        typeof e.uuid === "string" &&
        typeof e.createdAt === "number" &&
        typeof e.totalRecords === "number" &&
        (e.season === "2025" || e.season === "2026")
    );
  } catch {
    return [];
  }
};

const write = (list: LocalRecentExport[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
};

export const getLocalRecent = (): LocalRecentExport[] => read();

export const addLocalRecent = (
  entry: LocalRecentExport
): LocalRecentExport[] => {
  const current = read().filter((e) => e.uuid !== entry.uuid);
  const next = [entry, ...current].slice(0, MAX);
  write(next);
  return next;
};
