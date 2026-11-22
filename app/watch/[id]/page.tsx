import getSql from "@/app/getSql";
import { fetchData } from "@/app/fetchFeed";
import CastWrapper from "@/app/room/[id]/cast/CastWrapper";

export default async function CastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: gameIdStr } = await params;
  const gameId = Number(gameIdStr);

  const sql = getSql(false);
  const data = await fetchData(sql, gameId, "spectate");
  return <CastWrapper game={data} userId={null} token={null} />;
}
