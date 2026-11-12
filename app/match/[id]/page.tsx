import { fetchData } from "@/app/fetchFeed";
import getSql from "@/app/getSql";
import { Metadata } from "next";
import SingleMatchWrapper from "./SingleMatchWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: gameIdStr } = await params;
  const gameId = Number(gameIdStr);
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
  // TODO: handle malformed ids?
  const { id: gameIdStr } = await params;
  const gameId = Number(gameIdStr);
  const sql = getSql();
  const data = await fetchData(sql, gameId, "spectate");
  return <SingleMatchWrapper game={data} />;
}
