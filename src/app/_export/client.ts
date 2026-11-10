const ENDPOINT = "https://api.ftcscout.org/graphql";

export async function executeGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  return json.data!;
}
