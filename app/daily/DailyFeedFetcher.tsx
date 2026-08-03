"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { LocalDate, toISODate } from "./localDate";
import useAttemptNumber from "./useAttemptNumber";
import { db } from "../db";
import Daily from "./Daily";
import { DailyData } from "./page";
import { PracticeVariant } from "../PracticeVariantContext";

type Props = {
  date: LocalDate;
  dailyData: DailyData;
  variant: PracticeVariant;
};

export default function DailyFeedFetcher({ date, dailyData, variant }: Props) {
  const isoDate = toISODate(date);
  const [attempt, setAttempt] = useAttemptNumber(isoDate, variant);

  const feed = useLiveQuery(
    () => db.dailyFeed.where({ date: isoDate, attempt, variant }).sortBy("time"),
    [attempt, isoDate, variant]
  );

  if (feed == null) {
    return null;
  }
  return (
    <Daily
      date={date}
      dailyData={dailyData}
      attempt={attempt}
      setAttempt={setAttempt}
      feed={feed}
      variant={variant}
    />
  );
}
