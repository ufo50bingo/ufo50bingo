import SingleMatchWrapper from "./SingleMatchWrapper";
import fetchMatch from "@/app/matches/fetchMatch";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await fetchMatch(id);
  if (match == null) {
    return `Failed to find match with ID ${id}`;
  }
  return <SingleMatchWrapper match={match} />;
}
