import { createAlertsClient, AlertsError } from "@kennanhunter/alert-client";
import { log } from "./log";

const getApiKey = async (): Promise<string | null> => {
  const mod = (await import("cloudflare:workers")) as {
    env?: Record<string, unknown>;
  };
  const key = mod?.env?.ALERT_API_KEY;
  return typeof key === "string" && key.length > 0 ? key : null;
};

type ExportCreatedInput = {
  uuid: string;
  season: string;
  totalRecords: number;
  totalBatches: number;
  successes: number;
  errors: number;
  durationMs: number;
  request: Request;
};

const headerOrNull = (req: Request, name: string): string | null => {
  const v = req.headers.get(name);
  return v && v.length > 0 ? v : null;
};

export const notifyExportCreated = async (
  input: ExportCreatedInput
): Promise<void> => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    log.warn("alerts", "ALERT_API_KEY not set; skipping alert", {
      uuid: input.uuid,
    });
    return;
  }

  const { request } = input;
  const ip =
    headerOrNull(request, "cf-connecting-ip") ??
    headerOrNull(request, "x-real-ip") ??
    headerOrNull(request, "x-forwarded-for");
  const country = headerOrNull(request, "cf-ipcountry");
  const city = headerOrNull(request, "cf-ipcity");
  const region = headerOrNull(request, "cf-region");
  const colo = headerOrNull(request, "cf-colo") ?? headerOrNull(request, "cf-ray");
  const userAgent = headerOrNull(request, "user-agent");
  const referer = headerOrNull(request, "referer");
  const asn =
    headerOrNull(request, "cf-asn") ?? headerOrNull(request, "cf-iplongitude");

  const url = new URL(request.url);

  const metadata = {
    uuid: input.uuid,
    season: input.season,
    totalRecords: input.totalRecords,
    totalBatches: input.totalBatches,
    successes: input.successes,
    errors: input.errors,
    durationMs: input.durationMs,
    request: {
      method: request.method,
      url: request.url,
      host: url.host,
      path: url.pathname,
    },
    client: {
      ip,
      country,
      city,
      region,
      colo,
      asn,
      userAgent,
      referer,
    },
    headers: Object.fromEntries(request.headers),
  };

  const client = createAlertsClient({ apiKey, mode: "remote" });
  try {
    await client.send({
      level: "info",
      source: "ftc-scout-export",
      embed: {
        title: "Export created",
        description: `${input.season} · ${input.totalRecords} records`,
        color: 0x4ade80,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "uuid", value: input.uuid, inline: false },
          { name: "season", value: input.season, inline: true },
          {
            name: "records",
            value: String(input.totalRecords),
            inline: true,
          },
          {
            name: "duration",
            value: `${(input.durationMs / 1000).toFixed(1)}s`,
            inline: true,
          },
          { name: "ip", value: ip ?? "unknown", inline: true },
          { name: "country", value: country ?? "unknown", inline: true },
          { name: "city", value: city ?? "unknown", inline: true },
        ],
        footer: { text: "ftc-scout-export" },
      },
      metadata,
    });
  } catch (err) {
    if (err instanceof AlertsError) {
      log.error("alerts", "alert send failed", {
        uuid: input.uuid,
        status: err.status,
        body: err.body,
      });
    } else {
      log.error("alerts", "alert send failed", {
        uuid: input.uuid,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
