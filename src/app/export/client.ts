import type { TypedDocumentString } from "../../gql/graphql";

const ENDPOINT = "https://api.ftcscout.org/graphql";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<TResult> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
    },
    body: JSON.stringify({ query: query.toString(), variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    data?: TResult;
    errors?: { message: string }[];
  };
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  return json.data!;
}
