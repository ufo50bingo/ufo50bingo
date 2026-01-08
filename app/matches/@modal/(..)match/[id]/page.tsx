import fetchMatch from "@/app/matches/fetchMatch";
import ResultModal from "@/app/matches/ResultModal";

export default async function MatchModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const match = await fetchMatch(id);
  if (match == null) {
    return `Failed to find match with ID ${id}`;
  }
  return <ResultModal isMobile={false} match={match} />;
}
