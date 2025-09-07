"use client";

import { Match } from "@/app/matches/Matches";
import dynamic from "next/dynamic";

const SingleMatch = dynamic(() => import("./SingleMatch"), { ssr: false });

type Props = {
  match: Match;
};

export default function SingleMatchWrapper({ match }: Props) {
  return <SingleMatch match={match} />;
}
