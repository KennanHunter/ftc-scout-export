import { getExportsBinding, getExport } from "@/app/_export/kv";
import { log } from "@/app/_export/log";

export const runtime = "edge";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ uuid: string }> }
): Promise<Response> {
  const { uuid } = await ctx.params;
  log.info("api.export.get", "GET begin", { uuid });
  const kv = await getExportsBinding();
  if (!kv) {
    log.error("api.export.get", "KV not bound", { uuid });
    return new Response(JSON.stringify({ error: "KV not bound" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  const payload = await getExport(kv, uuid);
  if (!payload) {
    log.warn("api.export.get", "not found", { uuid });
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  log.info("api.export.get", "ok", {
    uuid,
    totalRecords: payload.totalRecords,
  });
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
