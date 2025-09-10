"use client";

import { Match } from "@/app/matches/Matches";
import dynamic from "next/dynamic";
import { ScheduledMatch } from "./fetchSchedule";

const Schedule = dynamic(() => import("./Schedule"), { ssr: false });

type Props = {
  schedule: ReadonlyArray<ScheduledMatch>;
};

export default function ScheduleWrapper({ schedule }: Props) {
  return <Schedule schedule={schedule} />;
}
