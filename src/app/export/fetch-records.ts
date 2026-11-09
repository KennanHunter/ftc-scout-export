import { graphql } from "../../gql";
import { execute } from "./client";

export const TeamsSearchQuery = graphql(`
  query TeamsSearch {
    teamsSearch {
      number
      name
      rookieYear
      website
      location {
        city
        country
        state
        venue
      }
    }
  }
`);

export type Team = Awaited<
  ReturnType<typeof fetchAllTeams>
> extends Map<number, infer T>
  ? T
  : never;

export const fetchAllTeams = async () => {
  const data = await execute(TeamsSearchQuery);
  const teamMap = new Map<number, (typeof data.teamsSearch)[number]>();
  data.teamsSearch.forEach((team) => teamMap.set(team.number, team));
  return teamMap;
};

export const downloadBlob = (fileBlob: Blob, prefix: string) => {
  const element = document.createElement("a");
  element.href = URL.createObjectURL(fileBlob);

  const now = new Date();
  element.download = `${prefix}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.csv`;

  document.body.appendChild(element);
  element.click();
  element.remove();
};

export const formatLocation = (team: Team | undefined) =>
  team?.location
    ? `${team.location.city} ${team.location.state} ${team.location.country}`.trim()
    : "";

export const fmt = (n: number | null | undefined) =>
  typeof n === "number" ? n.toFixed(2) : "";

export const q = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
};

export type BatchStats = { successes: number; errors: number };

export type ProgressCallback = (completed: number, total: number) => void;

export const runBatches = async <T>(
  factories: Array<() => Promise<T[]>>,
  onProgress?: ProgressCallback
): Promise<{ rows: T[]; stats: BatchStats }> => {
  const total = factories.length;
  let completed = 0;
  let successes = 0;
  let errors = 0;

  const results = await Promise.all(
    factories.map(async (factory) => {
      let rows: T[] | null = null;
      try {
        rows = await factory();
      } catch (firstErr) {
        try {
          rows = await factory();
        } catch (retryErr) {
          console.error("batch failed after retry:", retryErr, firstErr);
        }
      }
      completed++;
      if (rows) successes++;
      else errors++;
      onProgress?.(completed, total);
      return rows;
    })
  );

  const rows: T[] = [];
  for (const r of results) if (r) rows.push(...r);
  return { rows, stats: { successes, errors } };
};

export const quoteRow = (
  values: Array<string | number | null | undefined>
) => values.map(q).join(",");
