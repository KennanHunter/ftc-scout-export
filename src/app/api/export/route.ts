import {
  getExportsBinding,
  putExport,
  pushRecentExport,
} from "@/app/_export/kv";
import {
  prepareContext,
  runBatches,
  type BatchSpec,
} from "@/app/_export/stream";
import type {
  ExportPayload,
  FullRecord,
  SeasonKey,
  StreamEvent,
} from "@/app/_export/types";
import { sortByNonPenalty } from "@/app/_export/project";
import { log } from "@/app/_export/log";

export const runtime = "edge";

type StartBody = {
  season: SeasonKey;
  totalTeams: number;
  uuid?: string;
};

const encodeEvent = (ev: StreamEvent, enc: TextEncoder) =>
  enc.encode(JSON.stringify(ev) + "\n");

export async function POST(req: Request): Promise<Response> {
  const t0 = Date.now();
  log.info("api.export", "POST begin");
  let body: StartBody;
  try {
    body = (await req.json()) as StartBody;
  } catch {
    log.warn("api.export", "invalid json body");
    return new Response("invalid json", { status: 400 });
  }
  if (!body?.season || !body.totalTeams || body.totalTeams < 1) {
    log.warn("api.export", "missing params", { body });
    return new Response("missing season or totalTeams", { status: 400 });
  }

  const uuid = body.uuid && /^[0-9a-f-]{20,}$/i.test(body.uuid)
    ? body.uuid
    : crypto.randomUUID();
  log.info("api.export", "accepted", {
    uuid,
    season: body.season,
    totalTeams: body.totalTeams,
  });
  const kv = await getExportsBinding();
  if (!kv) log.warn("api.export", "no KV binding; KV write will be skipped");
  const enc = new TextEncoder();
  const season = body.season;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const abort = new AbortController();
      const closeCleanly = () => {
        try {
          controller.close();
        } catch {}
      };
      const send = (ev: StreamEvent) => {
        try {
          controller.enqueue(encodeEvent(ev, enc));
        } catch {}
      };

      try {
        send({
          type: "phase",
          phase: "teamMap",
          label: "Fetching team list…",
        });
        const ctx = await prepareContext(season, body.totalTeams);
        send({
          type: "phase",
          phase: "batches",
          label: "Fetching OPR data…",
        });
        send({
          type: "meta",
          uuid,
          season,
          totalBatches: ctx.batches.length,
        });

        const all: FullRecord[] = [];
        const errorSpecs: BatchSpec[] = [];

        const { successes, errors } = await runBatches(ctx, ctx.batches, {
          signal: abort.signal,
          onRows: (batchIndex, rows) => {
            all.push(...rows);
            send({ type: "rows", batchIndex, rows });
          },
          onProgress: (completed, total) =>
            send({ type: "progress", completed, total }),
          onError: (spec, message) => {
            errorSpecs.push(spec);
            send({
              type: "error",
              batchIndex: spec.index,
              skip: spec.skip,
              take: spec.take,
              message,
            });
          },
        });

        log.info("api.export", "stream done", {
          uuid,
          successes,
          errors,
          ms: Date.now() - t0,
        });
        send({ type: "done", successes, errors });

        if (errors === 0 && kv) {
          const payload: ExportPayload = {
            uuid,
            season,
            createdAt: Date.now(),
            totalRecords: all.length,
            records: sortByNonPenalty(all),
          };
          try {
            await putExport(kv, payload);
            await pushRecentExport(kv, {
              uuid,
              season,
              createdAt: payload.createdAt,
              totalRecords: payload.totalRecords,
            });
          } catch (e) {
            log.error("api.export", "KV put failed", {
              uuid,
              err: e instanceof Error ? e.message : String(e),
            });
          }
        } else if (errors === 0 && !kv) {
          log.warn("api.export", "no KV binding; skipping write", { uuid });
        } else {
          log.warn("api.export", "errors present; skipping KV write", {
            uuid,
            errors,
          });
        }
      } catch (err) {
        log.error("api.export", "stream fatal", {
          uuid,
          err: err instanceof Error ? err.message : String(err),
        });
        send({
          type: "error",
          batchIndex: -1,
          skip: 0,
          take: 0,
          message: err instanceof Error ? err.message : String(err),
        });
        send({ type: "done", successes: 0, errors: 1 });
      } finally {
        void abort;
        closeCleanly();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Export-UUID": uuid,
    },
  });
}
