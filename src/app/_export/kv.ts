import type { ExportPayload } from "./types";
import { log } from "./log";

export type ExportsKV = {
  get: {
    (key: string, type: "json"): Promise<unknown>;
  };
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ) => Promise<void>;
};

export type RecentEntry = {
  uuid: string;
  season: string;
  createdAt: number;
  totalRecords: number;
};

const RECENT_KEY = "recent:index";
const RECENT_MAX = 20;

const BINDING_NAME = "FTC_SCOUT_EXPORT_DATA";
const TTL_SECONDS = 60 * 60 * 24 * 30;

export const getExport = async (
  kv: ExportsKV,
  uuid: string
): Promise<ExportPayload | null> => {
  const t0 = Date.now();
  const payload = (await kv.get(uuid, "json")) as ExportPayload | null;
  log.info("kv", payload ? "get hit" : "get miss", {
    uuid,
    ms: Date.now() - t0,
  });
  return payload;
};

export const getRecentExports = async (
  kv: ExportsKV
): Promise<RecentEntry[]> => {
  const list = (await kv.get(RECENT_KEY, "json")) as RecentEntry[] | null;
  return Array.isArray(list) ? list : [];
};

export const pushRecentExport = async (
  kv: ExportsKV,
  entry: RecentEntry
): Promise<void> => {
  const current = await getRecentExports(kv);
  const next = [entry, ...current.filter((e) => e.uuid !== entry.uuid)].slice(
    0,
    RECENT_MAX
  );
  await kv.put(RECENT_KEY, JSON.stringify(next));
  log.info("kv", "recent updated", { size: next.length });
};

export const putExport = async (
  kv: ExportsKV,
  payload: ExportPayload
): Promise<void> => {
  const t0 = Date.now();
  const body = JSON.stringify(payload);
  log.info("kv", "put begin", {
    uuid: payload.uuid,
    totalRecords: payload.totalRecords,
    bytes: body.length,
  });
  await kv.put(payload.uuid, body, { expirationTtl: TTL_SECONDS });
  log.info("kv", "put done", {
    uuid: payload.uuid,
    ms: Date.now() - t0,
  });
};

export const getExportsBinding = async (): Promise<ExportsKV | null> => {
  const mod = (await import("cloudflare:workers")) as {
    env?: Record<string, unknown>;
  };
  const kv = mod?.env?.[BINDING_NAME] as ExportsKV | undefined;
  if (!kv) {
    log.error("kv", "FTC_SCOUT_EXPORT_DATA binding not present on env");
    return null;
  }
  return kv;
};
