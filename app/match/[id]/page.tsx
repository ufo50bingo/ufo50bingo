import { fetchData } from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import SingleMatchWrapper from "./SingleMatchWrapper";

// old IDs were strings. Redirect them to the new numeric IDs
async function getGameId(idStr: string): Promise<number> {
  const maybeIdNum = Number(idStr);
  if (Number.isInteger(maybeIdNum)) {
    return maybeIdNum;
  }
  const sql = getSql();
  const rows =
    await sql`SELECT game_id FROM legacy_match WHERE old_id = ${idStr}`;
  if (rows.length === 0) {
    notFound();
  }
  permanentRedirect(`/match/${rows[0].game_id}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: gameIdStr } = await params;
  const gameId = await getGameId(gameIdStr);
  const sql = getSql();
  const data = await fetchData(sql, gameId, "spectate");
  return {
    title: data.game.name,
    description: `View results for UFO 50 Bingo match "${data.game.name}"`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: gameIdStr } = await params;
  const gameId = await getGameId(gameIdStr);
  const sql = getSql();
  const data = await fetchData(sql, gameId, "spectate");
  return <SingleMatchWrapper game={data} />;
}
