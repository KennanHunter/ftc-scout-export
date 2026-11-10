import { getExportsBinding, getExport } from "@/app/_export/kv";
import { buildCSV } from "@/app/_export/csv";
import { log } from "@/app/_export/log";

export const runtime = "edge";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ uuid: string }> }
): Promise<Response> {
  const { uuid } = await ctx.params;
  log.info("api.export.csv", "GET begin", { uuid });
  const kv = await getExportsBinding();
  if (!kv) {
    log.error("api.export.csv", "KV not bound", { uuid });
    return new Response("KV not bound", { status: 503 });
  }
  const payload = await getExport(kv, uuid);
  if (!payload) {
    log.warn("api.export.csv", "not found", { uuid });
    return new Response("not found", { status: 404 });
  }
  const csv = buildCSV(payload.season, payload.records);
  log.info("api.export.csv", "ok", {
    uuid,
    bytes: csv.length,
    rows: payload.totalRecords,
  });
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": `inline; filename="ftc-export-${payload.season}-${uuid}.csv"`,
    },
  });
}
