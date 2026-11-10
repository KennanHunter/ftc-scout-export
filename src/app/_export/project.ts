import type {
  FullRecord2022,
  FullRecord2023,
  FullRecord2024,
  FullRecord2025,
  FullRecord2026,
  SeasonKey,
  TeamInfo,
} from "./types";

export const HEADER_COLS_2022 = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "event",
  "oprTotal",
  "oprTotalNp",
  "oprAuto",
  "oprTeleop",
  "oprEndgame",
  "oprAutoCone",
  "oprDcHigh",
  "oprDcMedium",
  "oprDcLow",
  "oprDcTerminal",
  "oprCircuit",
  "oprOwnership",
] as const;

export const HEADER_COLS_2023 = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "event",
  "oprTotal",
  "oprTotalNp",
  "oprAuto",
  "oprTeleop",
  "oprEndgame",
  "oprAutoPixel",
  "oprAutoBackstage",
  "oprAutoBackdrop",
  "oprAutoNav",
  "oprDcBackstage",
  "oprDcBackdrop",
  "oprDrone",
  "oprMosaic",
] as const;

export const HEADER_COLS_2024 = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "event",
  "oprTotal",
  "oprTotalNp",
  "oprAuto",
  "oprTeleop",
  "oprEndgame (dcParkPoints)",
] as const;

export const HEADER_COLS_2025 = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "event",
  "oprTotal",
  "oprTotalNp",
  "oprAuto",
  "oprTeleopCombined",
  "oprTeleop (teleopCombined - dcBasePoints)",
  "oprDcArtifactPoints",
  "oprDcPatternPoints",
  "oprDcDepotPoints",
  "oprEndgame (dcBasePoints)",
] as const;

export const HEADER_COLS_2026 = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "event",
  "oprTotal",
  "oprTotalNp",
  "oprAuto",
  "oprTeleop",
  "oprAutoHive",
  "oprAutoLeaveIndividual",
  "oprAutoParkIndividual",
  "oprDcHive",
  "oprDcFlower",
  "oprDcGarden",
  "oprDcPark",
  "oprTotalTips",
  "avgSwarmRp",
  "avgPollinator1Rp",
  "avgPollinator2Rp",
] as const;

export const headersFor = (season: SeasonKey) =>
  season === "2022"
    ? HEADER_COLS_2022
    : season === "2023"
    ? HEADER_COLS_2023
    : season === "2024"
    ? HEADER_COLS_2024
    : season === "2025"
    ? HEADER_COLS_2025
    : HEADER_COLS_2026;

export const seasonLabel = (season: SeasonKey): string =>
  season === "2022"
    ? "Power Play 2022–2023"
    : season === "2023"
    ? "Centerstage 2023–2024"
    : season === "2024"
    ? "Into The Deep 2024–2025"
    : season === "2025"
    ? "Decode 2025–2026"
    : "Biobuzz 2026–2027";

export const seasonChipClass = (season: SeasonKey): string =>
  season === "2022"
    ? "bg-rose-900/60 border border-rose-700 text-rose-200"
    : season === "2023"
    ? "bg-sky-900/60 border border-sky-700 text-sky-200"
    : season === "2024"
    ? "bg-emerald-900/60 border border-emerald-700 text-emerald-200"
    : season === "2025"
    ? "bg-amber-900/60 border border-amber-700 text-amber-200"
    : "bg-indigo-900/60 border border-indigo-700 text-indigo-200";

export const formatLocation = (team: TeamInfo | null | undefined) =>
  team?.location
    ? `${team.location.city ?? ""} ${team.location.state ?? ""} ${
        team.location.country ?? ""
      }`
        .replace(/\s+/g, " ")
        .trim()
    : "";

export const fmt = (n: number | null | undefined) =>
  typeof n === "number" ? Number(n.toFixed(2)) : "";

export const ftcScoutUrl = (teamNumber: number) =>
  `https://ftcscout.org/teams/${teamNumber}`;

export type RowCell = string | number;

export const projectRow2022 = (r: FullRecord2022): RowCell[] => {
  const t = r.team;
  const o = r.opr;
  return [
    r.teamNumber,
    t?.name ?? "",
    t?.rookieYear ?? "",
    ftcScoutUrl(r.teamNumber),
    t?.website ?? "",
    formatLocation(t),
    r.eventName ?? "",
    fmt(o?.totalPoints),
    fmt(o?.totalPointsNp),
    fmt(o?.autoPoints),
    fmt(o?.dcPoints),
    fmt(o?.egPoints),
    fmt(o?.autoConePoints),
    fmt(o?.dcHighPoints),
    fmt(o?.dcMediumPoints),
    fmt(o?.dcLowPoints),
    fmt(o?.dcTerminalPoints),
    fmt(o?.circuitPoints),
    fmt(o?.ownershipPoints),
  ];
};

export const projectRow2023 = (r: FullRecord2023): RowCell[] => {
  const t = r.team;
  const o = r.opr;
  return [
    r.teamNumber,
    t?.name ?? "",
    t?.rookieYear ?? "",
    ftcScoutUrl(r.teamNumber),
    t?.website ?? "",
    formatLocation(t),
    r.eventName ?? "",
    fmt(o?.totalPoints),
    fmt(o?.totalPointsNp),
    fmt(o?.autoPoints),
    fmt(o?.dcPoints),
    fmt(o?.egPoints),
    fmt(o?.autoPixelPoints),
    fmt(o?.autoBackstagePoints),
    fmt(o?.autoBackdropPoints),
    fmt(o?.autoNavPoints),
    fmt(o?.dcBackstagePoints),
    fmt(o?.dcBackdropPoints),
    fmt(o?.dronePoints),
    fmt(o?.mosaicPoints),
  ];
};

export const projectRow2024 = (r: FullRecord2024): RowCell[] => {
  const t = r.team;
  const o = r.opr;
  return [
    r.teamNumber,
    t?.name ?? "",
    t?.rookieYear ?? "",
    ftcScoutUrl(r.teamNumber),
    t?.website ?? "",
    formatLocation(t),
    r.eventName ?? "",
    fmt(o?.totalPoints),
    fmt(o?.totalPointsNp),
    fmt(o?.autoPoints),
    fmt(o ? o.dcPoints - o.dcParkPoints : undefined),
    fmt(o?.dcParkPoints),
  ];
};

export const projectRow2025 = (r: FullRecord2025): RowCell[] => {
  const t = r.team;
  const o = r.opr;
  return [
    r.teamNumber,
    t?.name ?? "",
    t?.rookieYear ?? "",
    ftcScoutUrl(r.teamNumber),
    t?.website ?? "",
    formatLocation(t),
    r.eventName ?? "",
    fmt(o?.totalPoints),
    fmt(o?.totalPointsNp),
    fmt(o?.autoPoints),
    fmt(o?.dcPoints),
    fmt(o ? o.dcPoints - o.dcBasePoints : undefined),
    fmt(o?.dcArtifactPoints),
    fmt(o?.dcPatternPoints),
    fmt(o?.dcDepotPoints),
    fmt(o?.dcBasePoints),
  ];
};

export const projectRow2026 = (r: FullRecord2026): RowCell[] => {
  const t = r.team;
  const o = r.opr;
  const a = r.avg;
  return [
    r.teamNumber,
    t?.name ?? "",
    t?.rookieYear ?? "",
    ftcScoutUrl(r.teamNumber),
    t?.website ?? "",
    formatLocation(t),
    r.eventName ?? "",
    fmt(o?.totalPoints),
    fmt(o?.totalPointsNp),
    fmt(o?.autoPoints),
    fmt(o?.dcPoints),
    fmt(o?.autoHivePoints),
    fmt(o?.autoLeavePointsIndividual),
    fmt(o?.autoParkPointsIndividual),
    fmt(o?.dcHivePoints),
    fmt(o?.dcFlowerPoints),
    fmt(o?.dcGardenPoints),
    fmt(o?.dcParkPoints),
    fmt(o?.tips),
    fmt(a?.swarmRp),
    fmt(a?.pollinator1Rp),
    fmt(a?.pollinator2Rp),
  ];
};

export const projectRow = (
  season: SeasonKey,
  record:
    | FullRecord2022
    | FullRecord2023
    | FullRecord2024
    | FullRecord2025
    | FullRecord2026
): RowCell[] =>
  season === "2022"
    ? projectRow2022(record as FullRecord2022)
    : season === "2023"
    ? projectRow2023(record as FullRecord2023)
    : season === "2024"
    ? projectRow2024(record as FullRecord2024)
    : season === "2025"
    ? projectRow2025(record as FullRecord2025)
    : projectRow2026(record as FullRecord2026);

export const sortByNonPenalty = <
  T extends
    | FullRecord2022
    | FullRecord2023
    | FullRecord2024
    | FullRecord2025
    | FullRecord2026
>(
  rows: T[]
): T[] =>
  [...rows].sort(
    (a, b) => (b.opr?.totalPointsNp ?? -Infinity) - (a.opr?.totalPointsNp ?? -Infinity)
  );
