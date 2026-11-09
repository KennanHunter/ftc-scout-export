/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type TepRecords2025QueryVariables = Exact<{
  skip: number;
  take: number;
}>;


export type TepRecords2025Query = { tepRecords: { data: Array<{ noFilterRank: number, data: { teamNumber: number, stats:
          | { opr: { totalPoints: number, totalPointsNp: number, autoPoints: number, dcPoints: number, dcArtifactPoints: number, dcPatternPoints: number, dcDepotPoints: number, dcBasePoints: number } }
          | Record<PropertyKey, never>
         | null } }> } };

export type TepRecords2026QueryVariables = Exact<{
  skip: number;
  take: number;
}>;


export type TepRecords2026Query = { tepRecords: { data: Array<{ noFilterRank: number, data: { teamNumber: number, stats:
          | { opr: { totalPoints: number, totalPointsNp: number, autoPoints: number, dcPoints: number, autoHivePoints: number, autoLeavePointsIndividual: number, autoParkPointsIndividual: number, dcHivePoints: number, dcFlowerPoints: number, dcGardenPoints: number, dcParkPoints: number, tips: number }, avg: { swarmRp: number, pollinator1Rp: number, pollinator2Rp: number } }
          | Record<PropertyKey, never>
         | null } }> } };

export type TeamsSearchQueryVariables = Exact<{ [key: string]: never; }>;


export type TeamsSearchQuery = { teamsSearch: Array<{ number: number, name: string, rookieYear: number, website: string | null, location: { city: string, country: string, state: string, venue: string | null } }> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const TepRecords2025Document = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<TepRecords2025Query, TepRecords2025QueryVariables>;
export const TepRecords2026Document = new TypedDocumentString(`
    query TepRecords2026($skip: Int!, $take: Int!) {
  tepRecords(season: 2026, skip: $skip, take: $take, region: All) {
    data {
      noFilterRank
      data {
        teamNumber
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
    `) as unknown as TypedDocumentString<TepRecords2026Query, TepRecords2026QueryVariables>;
export const TeamsSearchDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<TeamsSearchQuery, TeamsSearchQueryVariables>;