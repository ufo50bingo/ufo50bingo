import SingleMatchWrapper from "./SingleMatchWrapper";
import fetchMatch from "@/app/matches/fetchMatch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await fetchMatch(id);
  if (match == null) {
    return {
      title: "Match not found",
      description: `There is no match with ID ${id}`,
    };
  }
  return {
    title: match.name,
    description: `View results for UFO 50 Bingo match "${match.name}"`,
  }
}

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
