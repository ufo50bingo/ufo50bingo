"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { LocalDate, toISODate } from "./localDate";
import useAttemptNumber from "./useAttemptNumber";
import { db } from "../db";
import Daily from "./Daily";

type Props = {
    date: LocalDate;
    board: ReadonlyArray<string>;
};

export default function DailyFeedFetcher({ date, board }: Props) {
    const isoDate = toISODate(date);
    const [attempt, setAttempt] = useAttemptNumber(isoDate);

    const feed = useLiveQuery(() =>
        db.dailyFeed
            .where({ date: isoDate, attempt })
            .sortBy("time")
    );

    if (feed == null) {
        return null;
    }
    return (
        <Daily
            date={date}
            board={board}
            attempt={attempt}
            setAttempt={setAttempt}
            feed={feed}
        />
    );
}