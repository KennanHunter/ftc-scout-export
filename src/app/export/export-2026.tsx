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

const TepRecords2026Query = graphql(`
  query TepRecords2026($skip: Int!, $take: Int!) {
    tepRecords(season: 2026, skip: $skip, take: $take, region: All) {
      data {
        noFilterRank
        data {
          teamNumber
          event {
            name
          }
          stats {
            ... on TeamEventStats2026 {
              opr {
                totalPoints
                totalPointsNp
                autoPoints
                dcPoints
                autoHivePoints
                autoLeavePointsIndividual
                autoParkPointsIndividual
                dcHivePoints
                dcFlowerPoints
                dcGardenPoints
                dcParkPoints
                tips
              }
              avg {
                swarmRp
                pollinator1Rp
                pollinator2Rp
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
  "event",
  "opr",
  "nopr",
  "auto",
  "teleop",
  "autoHive",
  "autoLeaveIndividual",
  "autoParkIndividual",
  "dcHive",
  "dcFlower",
  "dcGarden",
  "dcPark",
  "totalTips",
  "avgSwarmRp",
  "avgPollinator1Rp",
  "avgPollinator2Rp",
];

export const buildCSV2026 = async (
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
      execute(TepRecords2026Query, { skip: batchSkip, take }).then((res) =>
        res.tepRecords.data.map(({ data: { teamNumber, event, stats } }) => {
          const opr = stats && "opr" in stats ? stats.opr : undefined;
          const avg = stats && "avg" in stats ? stats.avg : undefined;
          const team = teamMap.get(teamNumber);
          return quoteRow([
            teamNumber,
            team?.name,
            team?.rookieYear,
            `https://ftcscout.org/teams/${teamNumber}`,
            team?.website,
            formatLocation(team),
            event?.name,
            fmt(opr?.totalPoints),
            fmt(opr?.totalPointsNp),
            fmt(opr?.autoPoints),
            fmt(opr?.dcPoints),
            fmt(opr?.autoHivePoints),
            fmt(opr?.autoLeavePointsIndividual),
            fmt(opr?.autoParkPointsIndividual),
            fmt(opr?.dcHivePoints),
            fmt(opr?.dcFlowerPoints),
            fmt(opr?.dcGardenPoints),
            fmt(opr?.dcParkPoints),
            fmt(opr?.tips),
            fmt(avg?.swarmRp),
            fmt(avg?.pollinator1Rp),
            fmt(avg?.pollinator2Rp),
          ]);
        })
      )
    );
    skip += take;
  }

  const { rows, stats } = await runBatches(factories, onProgress);
  const csv = [quoteRow(HEADER_COLS), ...rows].join("\n");
  const download = () =>
    downloadBlob(new Blob([csv], { type: "text/csv" }), "ftc-export-biobuzz");
  if (stats.errors === 0) download();
  return { stats, download };
};
