import { useEffect, useMemo, useRef, useState } from "react";
import { TBoard } from "../matches/parseBingosyncData";
import Board from "../Board";
import {
  Container,
  Card,
  Text,
  Button,
  Stack,
  Title,
  List,
  Modal,
  Group,
  Anchor,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { getPrevDate, LocalDate, toISODate } from "./localDate";
import useDailyColor from "./useDailyColor";
import ColorSelector from "../room/[id]/common/ColorSelector";
import { DailyFeedRow, db } from "../db";
import useFeedTimer from "./useFeedTimer";
import getDailyFeedWithoutMistakes from "./getDailyFeedWithoutMistakes";
import getFeedWithDuration from "./getFeedWithDuration";
import getFirstBingoMajorityBlackoutIndex from "./findFirstBingoMajorityBlackout";
import Duration from "../practice/Duration";
import {
  IconArrowLeft,
  IconClipboard,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefreshAlert,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import getDurationText from "../practice/getDurationText";
import getBoardAtIndex from "./getBoardAtIndex";
import getEmojiBoard from "./getEmojiBoard";
import DailyBoardModal from "./DailyBoardModal";
import useWakeLock from "../room/[id]/play/useWakeLock";
import { DailyData } from "./page";
import EditDaily from "./EditDaily";
import getDailyTimes from "./getDailyTimes";

type Props = {
  date: LocalDate;
  dailyData: DailyData;
  attempt: number;
  setAttempt: (newAttempt: number) => unknown;
  feed: ReadonlyArray<DailyFeedRow>;
};

export default function Daily({
  date,
  dailyData,
  attempt,
  setAttempt,
  feed: feedWithMistakes,
}: Props) {
  const plainBoard = dailyData.board;
  const isoDate = toISODate(date);
  const [color, setColor] = useDailyColor();
  const [isStartingNewAttempt, setIsStartingNewAttempt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const feed = useMemo(
    () => getDailyFeedWithoutMistakes(feedWithMistakes, attempt),
    [feedWithMistakes, attempt]
  );
  const feedWithDuration = useMemo(
    () => getFeedWithDuration(feed, attempt),
    [feed, attempt]
  );
  const { bingo, majority, blackout } =
    getFirstBingoMajorityBlackoutIndex(feed);
  const finalMark = feed.findLastIndex((item) => item.type === "mark");
  const finalBoard =
    finalMark >= 0 &&
    finalMark !== bingo &&
    finalMark !== majority &&
    finalMark !== blackout
      ? finalMark
      : null;

  const [modalFeedIndex, setModalFeedIndex] = useState<number | null>(null);

  const completedIndexes = useMemo(() => {
    const newSet = new Set();
    feed.forEach((item) => {
      if (item.type === "mark") {
        newSet.add(item.squareIndex ?? 25);
      } else if (item.type === "clear") {
        newSet.delete(item.squareIndex ?? 25);
      }
    });
    return newSet;
  }, [feed]);

  const isHidden = useMemo(
    () => feed.every((item) => item.type !== "reveal"),
    [feed]
  );

  const board = useMemo<TBoard>(
    () =>
      plainBoard.map((name, index) => ({
        name,
        color: completedIndexes.has(index) ? color : "blank",
      })),
    [plainBoard, completedIndexes, color]
  );

  const { isRunning, pause, unpause, timer } = useFeedTimer(
    feed,
    isoDate,
    attempt
  );

  const isMobile = useMediaQuery("(max-width: 525px)");
  useWakeLock();

  const prevSearchParams = new URLSearchParams();
  prevSearchParams.set("date", toISODate(getPrevDate(date)));

  const pauseRef = useRef<() => void>(pause);
  // eslint-disable-next-line react-hooks/refs
  pauseRef.current = pause;
  useEffect(() => {
    const onBeforeUnload = () => {
      pauseRef.current();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return (
    <Container my="md">
      <Card shadow="sm" padding="sm" radius="md" withBorder>
        <Card.Section withBorder={true} inheritPadding={true} py="xs">
          <Stack gap={4}>
            <Group justify="space-between">
              <Group>
                <Tooltip label="View previous day">
                  <ActionIcon
                    component="a"
                    variant="subtle"
                    href={`/daily?${prevSearchParams.toString()}`}
                  >
                    <IconArrowLeft size={32} />
                  </ActionIcon>
                </Tooltip>
                <Title order={1}>
                  Daily Bingo {date.month}/{date.day}
                  {dailyData.title != null && dailyData.title != ""
                    ? ` — ${dailyData.title}`
                    : null}
                </Title>
              </Group>
              <ActionIcon color="green" onClick={() => setIsEditing(true)}>
                <IconEdit />
              </ActionIcon>
            </Group>
            {dailyData.creator != null && dailyData.creator != "" && (
              <Text size="sm">
                <em>Created by {dailyData.creator}</em>
              </Text>
            )}
            {dailyData.description != null && dailyData.description != "" && (
              <Text style={{ whiteSpace: "pre-line" }}>
                {dailyData.description}
              </Text>
            )}
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} py="xs">
          <Stack>
            <Text>
              Claim a bingo as fast as possible!
              <br />
              After you've claimed a bingo, you can optionally continue to claim
              majority (13 squares), and then a blackout (all 25 squares).
              <br />
              New daily bingos are available at <strong>midnight ET</strong>.
            </Text>
            <Text>
              If you prefer to play on Bingosync,{" "}
              <Anchor
                onClick={() => {
                  const fixedBoardJson = JSON.stringify(
                    plainBoard.map((name) => ({ name }))
                  );
                  navigator.clipboard.writeText(fixedBoardJson);
                }}
              >
                click here to copy the goal list
              </Anchor>{" "}
              and paste it into a <strong>Fixed Board</strong> custom game.
            </Text>
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} py="xs">
          <Stack style={{ alignItems: "center" }}>
            <div>
              <Stack gap={8}>
                <ColorSelector
                  label="Select your color"
                  color={color}
                  setColor={setColor}
                />
                <Board
                  board={board}
                  onClickSquare={async (squareIndex: number) => {
                    if (completedIndexes.has(squareIndex)) {
                      await db.dailyFeed.add({
                        type: "clear",
                        time: Date.now(),
                        squareIndex,
                        date: isoDate,
                        attempt,
                      });
                    } else {
                      await db.dailyFeed.add({
                        type: "mark",
                        time: Date.now(),
                        squareIndex,
                        date: isoDate,
                        attempt,
                      });
                    }
                  }}
                  hiddenText={
                    <>
                      <div>Click to reveal today's board.</div>
                      <div>Your timer will start as soon as you reveal.</div>
                      {attempt > 0 ? (
                        <div>Start playing as soon as you reveal!</div>
                      ) : (
                        <div>Start playing when the timer hits 0:00.0!</div>
                      )}
                    </>
                  }
                  isHidden={isHidden}
                  setIsHidden={async () => {
                    await db.dailyFeed.add({
                      type: "reveal",
                      time: Date.now(),
                      date: isoDate,
                      attempt,
                      squareIndex: null,
                    });
                  }}
                  shownDifficulties={["general"]}
                />
                <Group justify="space-between">
                  <Text>
                    Seed: {dailyData.seed.toString().padStart(6, "0")}
                  </Text>
                  <Text
                    style={{
                      alignSelf: "center",
                      fontVariantNumeric: "tabular-nums",
                    }}
                    size="xl"
                  >
                    {timer}
                  </Text>
                  <Button
                    onClick={() => (isRunning ? pause() : unpause())}
                    leftSection={
                      isRunning ? <IconPlayerPause /> : <IconPlayerPlay />
                    }
                  >
                    {isRunning ? "Pause" : "Resume"}
                  </Button>
                </Group>
              </Stack>
            </div>
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} py="xs">
          <Stack align="start">
            <Text size="lg">
              <strong>Your summary</strong>
            </Text>
            <List>
              <List.Item>
                <strong>Bingo:</strong>{" "}
                {bingo == null ? (
                  "Incomplete"
                ) : (
                  <Anchor onClick={() => setModalFeedIndex(bingo)}>
                    <Duration
                      duration={feedWithDuration[bingo][0]}
                      showDecimal={false}
                    />{" "}
                    (view board with times)
                  </Anchor>
                )}
              </List.Item>
              <List.Item>
                <strong>Majority:</strong>{" "}
                {majority == null ? (
                  "Incomplete"
                ) : (
                  <Anchor onClick={() => setModalFeedIndex(majority)}>
                    <Duration
                      duration={feedWithDuration[majority][0]}
                      showDecimal={false}
                    />{" "}
                    (view board with times)
                  </Anchor>
                )}
              </List.Item>
              <List.Item>
                <strong>Blackout:</strong>{" "}
                {blackout == null ? (
                  "Incomplete"
                ) : (
                  <Anchor onClick={() => setModalFeedIndex(blackout)}>
                    <Duration
                      duration={feedWithDuration[blackout][0]}
                      showDecimal={false}
                    />{" "}
                    (view board with times)
                  </Anchor>
                )}
              </List.Item>
              {finalBoard != null && (
                <List.Item>
                  <strong>Final Board:</strong>{" "}
                  <Anchor onClick={() => setModalFeedIndex(finalBoard)}>
                    <Duration
                      duration={feedWithDuration[finalBoard][0]}
                      showDecimal={false}
                    />{" "}
                    (view board with times)
                  </Anchor>
                </List.Item>
              )}
            </List>
            <Text>
              When you're done, copy your summary and paste it in the{" "}
              <Anchor href="https://discord.com/channels/525973026429206530/1433309975488499712">
                Daily Bingo Channel
              </Anchor>{" "}
              on the official Discord!
            </Text>
            <Button
              disabled={bingo == null && majority == null && blackout == null}
              leftSection={<IconClipboard size={16} />}
              onClick={() => {
                let summary = `Daily Bingo ${date.month}/${date.day} — `;
                let isFirst = true;
                if (bingo != null) {
                  if (isFirst) {
                    isFirst = false;
                  } else {
                    summary += "\n\n";
                  }
                  summary += `Bingo in ${getDurationText(
                    feedWithDuration[bingo][0],
                    false
                  )}\n`;
                  summary += getEmojiBoard(getBoardAtIndex(feed, bingo), color);
                }
                if (majority != null) {
                  if (isFirst) {
                    isFirst = false;
                  } else {
                    summary += "\n\n";
                  }
                  summary += `Majority in ${getDurationText(
                    feedWithDuration[majority][0],
                    false
                  )}\n`;
                  summary += getEmojiBoard(
                    getBoardAtIndex(feed, majority),
                    color
                  );
                }
                if (blackout != null) {
                  if (isFirst) {
                    isFirst = false;
                  } else {
                    summary += "\n\n";
                  }
                  summary += `Blackout in ${getDurationText(
                    feedWithDuration[blackout][0],
                    false
                  )}\n`;
                  summary += getEmojiBoard(
                    getBoardAtIndex(feed, blackout),
                    color
                  );
                }
                if (finalBoard != null) {
                  if (isFirst) {
                    isFirst = false;
                  } else {
                    summary += "\n\n";
                  }
                  summary += `Final Board in ${getDurationText(
                    feedWithDuration[finalBoard][0],
                    false
                  )}\n`;
                  summary += getEmojiBoard(
                    getBoardAtIndex(feed, finalBoard),
                    color
                  );
                }
                const completions = getDailyTimes(finalMark, feedWithDuration);
                const goalsAndTimes = completions.map(
                  ([squareIndex, _time, duration], index) => {
                    const ms =
                      index > 0
                        ? duration - completions[index - 1][2]
                        : duration;
                    const formattedDur = getDurationText(ms, false);
                    return `${index + 1}. ${formattedDur} — ${
                      plainBoard[squareIndex]
                    }`;
                  }
                );
                summary += "\n";
                summary += goalsAndTimes.join("\n");
                navigator.clipboard.writeText(summary);
              }}
            >
              Copy summary to clipboard
            </Button>
          </Stack>
        </Card.Section>
        <Card.Section withBorder={true} inheritPadding={true} py="xs">
          <Stack justify="start">
            <Text>
              Want to start over? Use this button to clear your data. On your
              next attempt, you will not have the 60 second scanning period.
            </Text>
            <div>
              <Button
                color="red"
                onClick={() => setIsStartingNewAttempt(true)}
                leftSection={<IconRefreshAlert />}
              >
                Start Over
              </Button>
            </div>
          </Stack>
        </Card.Section>
      </Card>
      {isStartingNewAttempt && (
        <Modal
          fullScreen={isMobile}
          centered={true}
          onClose={() => setIsStartingNewAttempt(false)}
          opened={true}
          title="Start Over"
        >
          <Stack>
            <span>Are you sure you want to start over?</span>
            <Group justify="end">
              <Button onClick={() => setIsStartingNewAttempt(false)}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setAttempt(attempt + 1);
                  setIsStartingNewAttempt(false);
                }}
              >
                Start Over
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
      {modalFeedIndex != null && (
        <DailyBoardModal
          board={plainBoard}
          feedIndex={modalFeedIndex}
          onClose={() => setModalFeedIndex(null)}
          isMobile={isMobile}
          feedWithDuration={feedWithDuration}
          color={color}
        />
      )}
      {isEditing && (
        <EditDaily
          dailyData={dailyData}
          date={date}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Container>
  );
}
