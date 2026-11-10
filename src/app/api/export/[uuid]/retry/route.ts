import { getExportsBinding, getExport, putExport } from "@/app/_export/kv";
import {
  prepareContext,
  runBatches,
  type BatchSpec,
} from "@/app/_export/stream";
import { sortByNonPenalty } from "@/app/_export/project";
import type {
  ExportPayload,
  FullRecord,
  SeasonKey,
  StreamEvent,
} from "@/app/_export/types";
import { log } from "@/app/_export/log";

export const runtime = "edge";

type RetryBody = {
  season: SeasonKey;
  batches: Array<{ index: number; skip: number; take: number }>;
  existingRecords: FullRecord[];
  expectedTotalBatches: number;
};

const encodeEvent = (ev: StreamEvent, enc: TextEncoder) =>
  enc.encode(JSON.stringify(ev) + "\n");

export async function POST(
  req: Request,
  ctx: { params: Promise<{ uuid: string }> }
): Promise<Response> {
  const { uuid } = await ctx.params;
  log.info("api.retry", "POST begin", { uuid });
  let body: RetryBody;
  try {
    body = (await req.json()) as RetryBody;
  } catch {
    log.warn("api.retry", "invalid json", { uuid });
    return new Response("invalid json", { status: 400 });
  }
  if (!body?.season || !Array.isArray(body.batches) || body.batches.length === 0) {
    log.warn("api.retry", "missing season or batches", { uuid });
    return new Response("missing season or batches", { status: 400 });
  }
  log.info("api.retry", "retrying batches", {
    uuid,
    count: body.batches.length,
    season: body.season,
  });

  const kv = await getExportsBinding();
  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: StreamEvent) => {
        try {
          controller.enqueue(encodeEvent(ev, enc));
        } catch {}
      };
      try {
        const runCtx = await prepareContext(body.season, 1);
        const specs: BatchSpec[] = body.batches.map((b) => ({
          index: b.index,
          skip: b.skip,
          take: b.take,
        }));

        send({
          type: "meta",
          uuid,
          season: body.season,
          totalBatches: specs.length,
        });

        const retriedRows: FullRecord[] = [];
        const stillFailed: BatchSpec[] = [];

        const { successes, errors } = await runBatches(runCtx, specs, {
          onRows: (batchIndex, rows) => {
            retriedRows.push(...rows);
            send({ type: "rows", batchIndex, rows });
          },
          onProgress: (completed, total) =>
            send({ type: "progress", completed, total }),
          onError: (spec, message) => {
            stillFailed.push(spec);
            send({
              type: "error",
              batchIndex: spec.index,
              skip: spec.skip,
              take: spec.take,
              message,
            });
          },
        });

        send({ type: "done", successes, errors });

        if (errors === 0 && kv) {
          const merged = sortByNonPenalty([
            ...body.existingRecords,
            ...retriedRows,
          ]);
          const payload: ExportPayload = {
            uuid,
            season: body.season,
            createdAt: Date.now(),
            totalRecords: merged.length,
            records: merged,
          };
          try {
            await putExport(kv, payload);
          } catch (e) {
            console.error("KV put failed", e);
          }
        }
        void getExport;
      } catch (err) {
        send({
          type: "error",
          batchIndex: -1,
          skip: 0,
          take: 0,
          message: err instanceof Error ? err.message : String(err),
        });
        send({ type: "done", successes: 0, errors: 1 });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
