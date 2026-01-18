import { Metadata } from "next";
import { fetchSchedule } from "./fetchSchedule";
import ScheduleWrapper from "./ScheduleWrapper";

export const metadata: Metadata = {
  title: "UFO 50 Bingo Schedule",
  description: "View upcoming UFO 50 Bingo matches!",
};

export default async function SchedulePage() {
  const schedule = await fetchSchedule();
  if (schedule == null) {
    return "Failed to fetch matches! Check the official league sheet instead.";
  }
  return <ScheduleWrapper schedule={schedule} />;
}
