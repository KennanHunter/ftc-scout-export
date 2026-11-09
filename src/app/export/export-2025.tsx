import { graphql } from "../../gql";
import { execute } from "./client";
import {
  BatchStats,
  downloadBlob,
  fetchAllTeams,
  fmt,
  formatLocation,
  ProgressCallback,
  quoteRow,
  runBatches,
} from "./fetch-records";

const TepRecords2025Query = graphql(`
  query TepRecords2025($skip: Int!, $take: Int!) {
    tepRecords(season: 2025, skip: $skip, take: $take, region: All) {
      data {
        noFilterRank
        data {
          teamNumber
          stats {
            ... on TeamEventStats2025 {
              opr {
                totalPoints
                totalPointsNp
                autoPoints
                dcPoints
                dcArtifactPoints
                dcPatternPoints
                dcDepotPoints
                dcBasePoints
              }
            }
          }
        }
      }
    }
  }
`);

const HEADER_COLS = [
  "teamnumber",
  "name",
  "rookieYear",
  "ftcScout",
  "website",
  "location",
  "opr",
  "nopr",
  "auto",
  "teleopCombined",
  "teleop (teleopCombined - dcBasePoints)",
  "dcArtifactPoints",
  "dcPatternPoints",
  "dcDepotPoints",
  "endgame (dcBasePoints)",
];

export const buildCSV2025 = async (
  totalTeams: number,
  onProgress?: ProgressCallback
): Promise<{ stats: BatchStats; download: () => void }> => {
  const teamMap = await fetchAllTeams();

  const take = 50;
  const factories: Array<() => Promise<string[]>> = [];
  let skip = 0;
  while (skip + take < totalTeams) {
    const batchSkip = skip;
    factories.push(() =>
      execute(TepRecords2025Query, { skip: batchSkip, take }).then((res) =>
        res.tepRecords.data.map(({ data: { teamNumber, stats } }) => {
          const opr = stats && "opr" in stats ? stats.opr : undefined;
          const team = teamMap.get(teamNumber);
          return quoteRow([
            teamNumber,
            team?.name,
            team?.rookieYear,
            `https://ftcscout.org/teams/${teamNumber}`,
            team?.website,
            formatLocation(team),
            fmt(opr?.totalPoints),
            fmt(opr?.totalPointsNp),
            fmt(opr?.autoPoints),
            fmt(opr?.dcPoints),
            fmt(opr ? opr.dcPoints - opr.dcBasePoints : undefined),
            fmt(opr?.dcArtifactPoints),
            fmt(opr?.dcPatternPoints),
            fmt(opr?.dcDepotPoints),
            fmt(opr?.dcBasePoints),
          ]);
        })
      )
    );
    skip += take;
  }

  const { rows, stats } = await runBatches(factories, onProgress);
  const csv = [quoteRow(HEADER_COLS), ...rows].join("\n");
  const download = () =>
    downloadBlob(new Blob([csv], { type: "text/csv" }), "ftc-export-decode");
  if (stats.errors === 0) download();
  return { stats, download };
};
