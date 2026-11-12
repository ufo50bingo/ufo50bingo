import { Alert } from "@mantine/core";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const { id } = await params;
  const name = "Unknown";
  return {
    title: name,
    description: `View results for UFO 50 Bingo match "${name}"`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Alert color="red">
      The Match page is not yet supported on the new backend.
    </Alert>
  );
}
