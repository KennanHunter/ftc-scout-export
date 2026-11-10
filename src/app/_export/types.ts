export type SeasonKey = "2025" | "2026";

export type TeamInfo = {
  number: number;
  name?: string | null;
  rookieYear?: number | null;
  website?: string | null;
  location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    venue?: string | null;
  } | null;
};

export type Opr2025 = {
  totalPoints: number;
  totalPointsNp: number;
  autoPoints: number;
  dcPoints: number;
  dcArtifactPoints: number;
  dcPatternPoints: number;
  dcDepotPoints: number;
  dcBasePoints: number;
};

export type Opr2026 = {
  totalPoints: number;
  totalPointsNp: number;
  autoPoints: number;
  dcPoints: number;
  autoHivePoints: number;
  autoLeavePointsIndividual: number;
  autoParkPointsIndividual: number;
  dcHivePoints: number;
  dcFlowerPoints: number;
  dcGardenPoints: number;
  dcParkPoints: number;
  tips: number;
};

export type Avg2026 = {
  swarmRp: number;
  pollinator1Rp: number;
  pollinator2Rp: number;
};

export type FullRecord2025 = {
  teamNumber: number;
  eventName: string | null;
  team: TeamInfo | null;
  opr: Opr2025 | null;
};

export type FullRecord2026 = {
  teamNumber: number;
  eventName: string | null;
  team: TeamInfo | null;
  opr: Opr2026 | null;
  avg: Avg2026 | null;
};

export type FullRecord = FullRecord2025 | FullRecord2026;

export type ExportPayload = {
  uuid: string;
  season: SeasonKey;
  createdAt: number;
  totalRecords: number;
  records: FullRecord[];
};

export type StreamEvent =
  | { type: "meta"; uuid: string; season: SeasonKey; totalBatches: number }
  | { type: "rows"; batchIndex: number; rows: FullRecord[] }
  | { type: "progress"; completed: number; total: number }
  | {
      type: "error";
      batchIndex: number;
      skip: number;
      take: number;
      message: string;
    }
  | { type: "done"; successes: number; errors: number };
