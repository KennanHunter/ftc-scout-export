export type SeasonKey = "2022" | "2023" | "2024" | "2025" | "2026";

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

export type Opr2022 = {
  totalPoints: number;
  totalPointsNp: number;
  autoPoints: number;
  dcPoints: number;
  egPoints: number;
  autoConePoints: number;
  dcLowPoints: number;
  dcMediumPoints: number;
  dcHighPoints: number;
  dcTerminalPoints: number;
  circuitPoints: number;
  ownershipPoints: number;
};

export type Opr2023 = {
  totalPoints: number;
  totalPointsNp: number;
  autoPoints: number;
  dcPoints: number;
  egPoints: number;
  autoPixelPoints: number;
  autoBackstagePoints: number;
  autoBackdropPoints: number;
  autoNavPoints: number;
  dcBackstagePoints: number;
  dcBackdropPoints: number;
  dronePoints: number;
  mosaicPoints: number;
};

export type Opr2024 = {
  totalPoints: number;
  totalPointsNp: number;
  autoPoints: number;
  dcPoints: number;
  dcParkPoints: number;
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

export type FullRecord2022 = {
  teamNumber: number;
  eventName: string | null;
  team: TeamInfo | null;
  opr: Opr2022 | null;
};

export type FullRecord2023 = {
  teamNumber: number;
  eventName: string | null;
  team: TeamInfo | null;
  opr: Opr2023 | null;
};

export type FullRecord2024 = {
  teamNumber: number;
  eventName: string | null;
  team: TeamInfo | null;
  opr: Opr2024 | null;
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

export type FullRecord =
  | FullRecord2022
  | FullRecord2023
  | FullRecord2024
  | FullRecord2025
  | FullRecord2026;

export type ExportPayload = {
  uuid: string;
  season: SeasonKey;
  createdAt: number;
  totalRecords: number;
  records: FullRecord[];
};

export type StreamPhase = "teamMap" | "batches";

export type StreamEvent =
  | { type: "phase"; phase: StreamPhase; label: string }
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
