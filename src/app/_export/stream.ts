import { executeGraphQL } from "./client";
import {
  Stats2025,
  Stats2026,
  TEAMS_SEARCH_QUERY,
  TEP_RECORDS_2025_QUERY,
  TEP_RECORDS_2026_QUERY,
  TeamsSearchResponse,
  TepRecordsResponse,
} from "./queries";
import type {
  FullRecord,
  FullRecord2025,
  FullRecord2026,
  SeasonKey,
  TeamInfo,
} from "./types";
import { sortByNonPenalty } from "./project";
import { log } from "./log";

const TAKE = 50;
const CONCURRENCY = 8;
const EXCLUDED_TEAM_NUMBERS = new Set<number>([99999]);

const fetchTeamMap = async (): Promise<Map<number, TeamInfo>> => {
  const t0 = Date.now();
  log.info("stream", "fetching team map");
  const data = await executeGraphQL<TeamsSearchResponse>(TEAMS_SEARCH_QUERY);
  const map = new Map<number, TeamInfo>();
  for (const t of data.teamsSearch) map.set(t.number, t);
  log.info("stream", "team map ready", {
    teams: map.size,
    ms: Date.now() - t0,
  });
  return map;
};

const mapBatch2025 = (
  data: TepRecordsResponse<Stats2025>,
  teamMap: Map<number, TeamInfo>
): FullRecord2025[] =>
  data.tepRecords.data
    .filter(({ data: d }) => !EXCLUDED_TEAM_NUMBERS.has(d.teamNumber))
    .map(({ data: d }) => ({
      teamNumber: d.teamNumber,
      eventName: d.event?.name ?? null,
      team: teamMap.get(d.teamNumber) ?? null,
      opr: d.stats?.opr ?? null,
    }));

const mapBatch2026 = (
  data: TepRecordsResponse<Stats2026>,
  teamMap: Map<number, TeamInfo>
): FullRecord2026[] =>
  data.tepRecords.data
    .filter(({ data: d }) => !EXCLUDED_TEAM_NUMBERS.has(d.teamNumber))
    .map(({ data: d }) => ({
      teamNumber: d.teamNumber,
      eventName: d.event?.name ?? null,
      team: teamMap.get(d.teamNumber) ?? null,
      opr: d.stats?.opr ?? null,
      avg: d.stats?.avg ?? null,
    }));

const runBatch = async (
  season: SeasonKey,
  skip: number,
  take: number,
  teamMap: Map<number, TeamInfo>
): Promise<FullRecord[]> => {
  if (season === "2025") {
    const resp = await executeGraphQL<TepRecordsResponse<Stats2025>>(
      TEP_RECORDS_2025_QUERY,
      { skip, take }
    );
    return mapBatch2025(resp, teamMap);
  }
  const resp = await executeGraphQL<TepRecordsResponse<Stats2026>>(
    TEP_RECORDS_2026_QUERY,
    { skip, take }
  );
  return mapBatch2026(resp, teamMap);
};

export type BatchSpec = { index: number; skip: number; take: number };

export const buildBatches = (totalTeams: number): BatchSpec[] => {
  const specs: BatchSpec[] = [];
  let skip = 0;
  let index = 0;
  while (skip + TAKE < totalTeams) {
    specs.push({ index, skip, take: TAKE });
    index++;
    skip += TAKE;
  }
  return specs;
};

export type StreamContext = {
  season: SeasonKey;
  batches: BatchSpec[];
  teamMap: Map<number, TeamInfo>;
};

export const prepareContext = async (
  season: SeasonKey,
  totalTeams: number
): Promise<StreamContext> => ({
  season,
  batches: buildBatches(totalTeams),
  teamMap: await fetchTeamMap(),
});

export type RunOptions = {
  onRows: (batchIndex: number, rows: FullRecord[]) => void;
  onProgress: (completed: number, total: number) => void;
  onError: (spec: BatchSpec, message: string) => void;
  signal?: AbortSignal;
};

export const runBatches = async (
  ctx: StreamContext,
  specs: BatchSpec[],
  opts: RunOptions
): Promise<{ successes: number; errors: number }> => {
  const total = specs.length;
  let completed = 0;
  let successes = 0;
  let errors = 0;
  let cursor = 0;

  const worker = async () => {
    while (cursor < specs.length) {
      if (opts.signal?.aborted) {
        log.warn("stream", "worker aborted");
        return;
      }
      const myIndex = cursor++;
      const spec = specs[myIndex];
      const t0 = Date.now();
      let rows: FullRecord[] | null = null;
      try {
        rows = await runBatch(ctx.season, spec.skip, spec.take, ctx.teamMap);
      } catch (firstErr) {
        log.warn("stream", "batch failed, retrying", {
          index: spec.index,
          skip: spec.skip,
          err: firstErr instanceof Error ? firstErr.message : String(firstErr),
        });
        try {
          rows = await runBatch(ctx.season, spec.skip, spec.take, ctx.teamMap);
        } catch (retryErr) {
          const msg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          log.error("stream", "batch failed after retry", {
            index: spec.index,
            skip: spec.skip,
            take: spec.take,
            err: msg,
          });
          opts.onError(spec, msg);
        }
      }
      completed++;
      if (rows) {
        successes++;
        const sorted = sortByNonPenalty(rows) as FullRecord[];
        log.info("stream", "batch ok", {
          index: spec.index,
          rows: sorted.length,
          ms: Date.now() - t0,
        });
        opts.onRows(spec.index, sorted);
      } else {
        errors++;
      }
      opts.onProgress(completed, total);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, specs.length) }, () => worker())
  );

  return { successes, errors };
};
