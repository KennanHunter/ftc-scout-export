import { getExportsBinding, getRecentExports } from "@/app/_export/kv";
import { log } from "@/app/_export/log";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const kv = await getExportsBinding();
  if (!kv) {
    log.error("api.recent", "KV not bound");
    return new Response(JSON.stringify({ error: "KV not bound" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  const list = await getRecentExports(kv);
  log.info("api.recent", "ok", { size: list.length });
  return new Response(JSON.stringify({ recents: list }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
