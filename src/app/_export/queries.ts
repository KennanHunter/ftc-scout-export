export const TEAMS_SEARCH_QUERY = `
  query TeamsSearch {
    teamsSearch {
      number
      name
      rookieYear
      website
      location {
        city
        country
        state
        venue
      }
    }
  }
`;

export const TEP_RECORDS_2025_QUERY = `
  query TepRecords2025($skip: Int!, $take: Int!) {
    tepRecords(season: 2025, skip: $skip, take: $take, region: All) {
      data {
        noFilterRank
        data {
          teamNumber
          event {
            name
          }
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
`;

export const TEP_RECORDS_2026_QUERY = `
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
`;

export type TeamsSearchResponse = {
  teamsSearch: Array<{
    number: number;
    name: string | null;
    rookieYear: number | null;
    website: string | null;
    location: {
      city: string | null;
      country: string | null;
      state: string | null;
      venue: string | null;
    } | null;
  }>;
};

export type TepRecordsResponse<Stats> = {
  tepRecords: {
    data: Array<{
      noFilterRank: number;
      data: {
        teamNumber: number;
        event: { name: string | null } | null;
        stats: Stats | null;
      };
    }>;
  };
};

export type Stats2025 = {
  opr: {
    totalPoints: number;
    totalPointsNp: number;
    autoPoints: number;
    dcPoints: number;
    dcArtifactPoints: number;
    dcPatternPoints: number;
    dcDepotPoints: number;
    dcBasePoints: number;
  } | null;
};

export type Stats2026 = {
  opr: {
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
  } | null;
  avg: {
    swarmRp: number;
    pollinator1Rp: number;
    pollinator2Rp: number;
  } | null;
};
