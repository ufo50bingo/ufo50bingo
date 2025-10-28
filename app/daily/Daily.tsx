"use client";

import { useMemo, useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import { Container, Card, Text, Button, Stack, Title, List } from "@mantine/core";
import { LocalDate, toISODate } from "./localDate";
import useDailyColor from "./useDailyColor";
import ColorSelector from "../room/[id]/common/ColorSelector";
import { DailyFeedRow, db } from "../db";
import useFeedTimer from "./useFeedTimer";
import getDailyFeedWithoutMistakes from "./getDailyFeedWithoutMistakes";
import getFeedWithDuration from "./getFeedWithDuration";
import getFirstBingoMajorityBlackoutIndex from "./findFirstBingoMajorityBlackout";
import Duration from "../practice/Duration";
import { IconRefreshAlert } from "@tabler/icons-react";

type Props = {
    date: LocalDate;
    board: ReadonlyArray<string>;
    attempt: number;
    setAttempt: (newAttempt: number) => unknown;
    feed: ReadonlyArray<DailyFeedRow>;
};

export default function Daily({ date, board: plainBoard, attempt, setAttempt, feed: feedWithMistakes }: Props) {
    const isoDate = toISODate(date);
    const [color, setColor] = useDailyColor();

    const feed = useMemo(() => getDailyFeedWithoutMistakes(feedWithMistakes), [feedWithMistakes]);
    const feedWithDuration = useMemo(() => getFeedWithDuration(feed), [feed]);
    const { bingo, majority, blackout } = getFirstBingoMajorityBlackoutIndex(feed);

    const completedIndexes = useMemo(() => {
        const newSet = new Set();
        feed.forEach(item => {
            if (item.type === "mark") {
                newSet.add(item.squareIndex ?? 25);
            } else if (item.type === "clear") {
                newSet.delete(item.squareIndex ?? 25);
            }
        });
        return newSet;
    }, [feed]);

    const isHidden = useMemo(() =>
        feed.every(item => item.type !== "reveal"),
        [feed],
    );

    const board = useMemo<TBoard>(() =>
        plainBoard
            .map((name, index) => ({ name, color: completedIndexes.has(index) ? color : "blank" })),
        [plainBoard, completedIndexes, color],
    );

    const { isRunning, pause, unpause, timer } = useFeedTimer(
        feed,
        isoDate,
        attempt,
    );

    return (
        <Container my="md">
            <Card shadow="sm" padding="sm" radius="md" withBorder>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <Stack>
                        <Title order={1}>Daily Bingo — {date.month}/{date.day}</Title>
                        <Text>
                            Your goal is to claim a bingo as fast as possible.<br />
                            After you've claimed a bingo, you can optionally continue to claim majority (13 squares),
                            and then a blackout (all 25 squares)!
                        </Text>
                        <ColorSelector label="Select your preferred color" color={color} setColor={setColor} />
                    </Stack>
                </Card.Section>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <Stack gap={4} style={{ alignSelf: "center" }}>
                        <Board
                            board={board}
                            onClickSquare={async (squareIndex: number) => {
                                if (completedIndexes.has(squareIndex)) {
                                    await db.dailyFeed.add({ type: "clear", time: Date.now(), squareIndex, date: isoDate, attempt });
                                } else {
                                    await db.dailyFeed.add({ type: "mark", time: Date.now(), squareIndex, date: isoDate, attempt });
                                }
                            }}
                            hiddenText={
                                <>
                                    <div>Click to reveal today's board.</div>
                                    <div>Your timer will start as soon as you reveal.</div>
                                    {attempt === 1
                                        ? <div>Start playing when the timer hits 0:00.0!</div>
                                        : <div>Start playing as soon as you reveal!</div>
                                    }
                                </>
                            }
                            isHidden={isHidden}
                            setIsHidden={async () => {
                                await db.dailyFeed.add({ type: "reveal", time: Date.now(), date: isoDate, attempt, squareIndex: null });
                            }}
                            shownDifficulties={[]}
                        />
                        <Text style={{ alignSelf: "center", fontVariantNumeric: "tabular-nums" }} size="xl">
                            {timer}
                        </Text>
                        <Button
                            onClick={() => (isRunning ? pause() : unpause())}
                            fullWidth={true}
                        >
                            {isRunning ? "Pause" : "Resume"}
                        </Button>
                    </Stack>
                </Card.Section>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <List>
                        <List.Item>Bingo: {bingo == null ? "Incomplete" : <Duration duration={feedWithDuration[bingo][0]} />}</List.Item>
                        <List.Item>Majority: {majority == null ? "Incomplete" : <Duration duration={feedWithDuration[majority][0]} />}</List.Item>
                        <List.Item>Blackout: {blackout == null ? "Incomplete" : <Duration duration={feedWithDuration[blackout][0]} />}</List.Item>
                    </List>
                </Card.Section>
                <Card.Section withBorder={true} inheritPadding={true} py="xs">
                    <Stack justify="start">
                        <Text>
                            Want to start over? Use this button to clear your data.
                            On your text attempt, you will not have the 60 second scanning period.
                        </Text>
                        <div>
                            <Button color="red" onClick={() => setAttempt(attempt + 1)} leftSection={<IconRefreshAlert />}>
                                Start Over
                            </Button>
                        </div>
                    </Stack>
                </Card.Section>
            </Card>
        </Container >
    );
}
