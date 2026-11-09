/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query TepRecords2025($skip: Int!, $take: Int!) {\n    tepRecords(season: 2025, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2025 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                dcArtifactPoints\n                dcPatternPoints\n                dcDepotPoints\n                dcBasePoints\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.TepRecords2025Document,
    "\n  query TepRecords2026($skip: Int!, $take: Int!) {\n    tepRecords(season: 2026, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2026 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                autoHivePoints\n                autoLeavePointsIndividual\n                autoParkPointsIndividual\n                dcHivePoints\n                dcFlowerPoints\n                dcGardenPoints\n                dcParkPoints\n                tips\n              }\n              avg {\n                swarmRp\n                pollinator1Rp\n                pollinator2Rp\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.TepRecords2026Document,
    "\n  query TeamsSearch {\n    teamsSearch {\n      number\n      name\n      rookieYear\n      website\n      location {\n        city\n        country\n        state\n        venue\n      }\n    }\n  }\n": typeof types.TeamsSearchDocument,
};
const documents: Documents = {
    "\n  query TepRecords2025($skip: Int!, $take: Int!) {\n    tepRecords(season: 2025, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2025 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                dcArtifactPoints\n                dcPatternPoints\n                dcDepotPoints\n                dcBasePoints\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.TepRecords2025Document,
    "\n  query TepRecords2026($skip: Int!, $take: Int!) {\n    tepRecords(season: 2026, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2026 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                autoHivePoints\n                autoLeavePointsIndividual\n                autoParkPointsIndividual\n                dcHivePoints\n                dcFlowerPoints\n                dcGardenPoints\n                dcParkPoints\n                tips\n              }\n              avg {\n                swarmRp\n                pollinator1Rp\n                pollinator2Rp\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.TepRecords2026Document,
    "\n  query TeamsSearch {\n    teamsSearch {\n      number\n      name\n      rookieYear\n      website\n      location {\n        city\n        country\n        state\n        venue\n      }\n    }\n  }\n": types.TeamsSearchDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TepRecords2025($skip: Int!, $take: Int!) {\n    tepRecords(season: 2025, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2025 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                dcArtifactPoints\n                dcPatternPoints\n                dcDepotPoints\n                dcBasePoints\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').TepRecords2025Document;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TepRecords2026($skip: Int!, $take: Int!) {\n    tepRecords(season: 2026, skip: $skip, take: $take, region: All) {\n      data {\n        noFilterRank\n        data {\n          teamNumber\n          event {\n            name\n          }\n          stats {\n            ... on TeamEventStats2026 {\n              opr {\n                totalPoints\n                totalPointsNp\n                autoPoints\n                dcPoints\n                autoHivePoints\n                autoLeavePointsIndividual\n                autoParkPointsIndividual\n                dcHivePoints\n                dcFlowerPoints\n                dcGardenPoints\n                dcParkPoints\n                tips\n              }\n              avg {\n                swarmRp\n                pollinator1Rp\n                pollinator2Rp\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').TepRecords2026Document;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TeamsSearch {\n    teamsSearch {\n      number\n      name\n      rookieYear\n      website\n      location {\n        city\n        country\n        state\n        venue\n      }\n    }\n  }\n"): typeof import('./graphql').TeamsSearchDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
