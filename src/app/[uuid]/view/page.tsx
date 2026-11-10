import ExportViewLoader from "@/app/_components/ExportViewLoader";

export const runtime = "edge";

export default async function ExportViewPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <ExportViewLoader uuid={uuid} />;
}
