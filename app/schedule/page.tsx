import { fetchSchedule } from "./fetchSchedule";
import ScheduleWrapper from "./ScheduleWrapper";

export default async function SchedulePage() {
  const schedule = await fetchSchedule();
  if (schedule == null) {
    return "Failed to fetch matches! Check the official league sheet instead.";
  }
  return <ScheduleWrapper schedule={schedule} />;
}
