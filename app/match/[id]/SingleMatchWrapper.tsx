"use client";

import { FullParsedGame } from "@/app/fetchFeed";
import dynamic from "next/dynamic";

const SingleMatch = dynamic(() => import("./SingleMatch"), { ssr: false });

type Props = {
  game: FullParsedGame;
};

export default function SingleMatchWrapper({ game }: Props) {
  return <SingleMatch game={game} />;
}
