"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { LocalDate, toISODate } from "./localDate";
import useAttemptNumber from "./useAttemptNumber";
import { db } from "../db";
import Daily from "./Daily";
import { DailyData } from "./page";

type Props = {
    date: LocalDate;
    dailyData: DailyData;
};

export default function DailyFeedFetcher({ date, dailyData }: Props) {
    const isoDate = toISODate(date);
    const [attempt, setAttempt] = useAttemptNumber(isoDate);

    const feed = useLiveQuery(() =>
        db.dailyFeed
            .where({ date: isoDate, attempt })
            .sortBy("time"),
        [attempt, isoDate],
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
        />
    );
}