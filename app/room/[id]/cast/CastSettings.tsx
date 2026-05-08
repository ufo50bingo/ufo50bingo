import { ORDERED_DIFFICULTY, DIFFICULTY_NAMES, Difficulty } from "@/app/goals";
import {
  Accordion,
  Affix,
  Alert,
  Button,
  Checkbox,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertSquareRounded, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import ColorSelector from "../common/ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import { IconType, SortType } from "./useLocalState";
import NotificationsSection, {
  SetSoundChoices,
  SoundChoices,
} from "../common/NotificationsSection";
import CreateBoardSection from "../common/CreateBoardSection";
import BottomSection from "../common/BottomSection";
import FileSyncSection from "./FileSyncSection";
import { GeneralCounts } from "./CastPage";
import { GeneralItem, TCountPosition } from "./Cast";
import GeneralOrderSelector, { TGeneralOrder } from "./GeneralOrderSelector";
import { Font } from "@/app/font/useFont";
import FontSelector from "@/app/font/FontSelector";

import classes from "./CastSettings.module.css";
import { FullSyncedTimerEvent, SyncedTimerState } from "../common/useSyncedTimer";
import TimerSection from "../common/TimerSection";
import { useShouldShortenContext } from "@/app/settings/ShouldShortenContext";

type Props = {
  id: string;
  seed: number;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  setLeftColor: (newColor: BingosyncColor) => unknown;
  setRightColor: (newColor: BingosyncColor) => unknown;
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
  sortType: SortType;
  setSortType: (newSortType: SortType) => unknown;
  iconType: IconType;
  setIconType: (newIconType: IconType) => unknown;
  hideByDefault: boolean;
  setHideByDefault: (newHideByDefault: boolean) => unknown;
  soundChoices: SoundChoices;
  setSoundChoices: SetSoundChoices;
  leftScore: number;
  rightScore: number;
  generalCounts: GeneralCounts;
  generalGoals: ReadonlyArray<GeneralItem>;
  showGameSelector: boolean;
  setShowGameSelector: (newShowGameSelector: boolean) => unknown;
  highlightCurrentGame: boolean;
  setHighlightCurrentGame: (newHighlightCurrentGame: boolean) => unknown;
  showRecentGames: boolean;
  setShowRecentGames: (newShowRecentGames: boolean) => unknown;
  numPlayers: number;
  setNumPlayers: (numPlayers: number) => unknown;
  countPosition: TCountPosition;
  setCountPosition: (newCountPosition: TCountPosition) => unknown;
  generalOrder: TGeneralOrder;
  setGeneralOrder: (newGeneralOrder: TGeneralOrder) => unknown;
  font: Font;
  setFont: (newFont: Font) => unknown;
  addEvent: (newEvent: FullSyncedTimerEvent) => Promise<void>;
  timerState: SyncedTimerState;
};

export default function CastSettings({
  id,
  seed,
  leftColor,
  rightColor,
  setLeftColor,
  setRightColor,
  shownDifficulties,
  setShownDifficulties,
  sortType,
  setSortType,
  iconType,
  setIconType,
  hideByDefault,
  setHideByDefault,
  soundChoices,
  setSoundChoices,
  leftScore,
  rightScore,
  generalCounts,
  generalGoals,
  showGameSelector,
  setShowGameSelector,
  highlightCurrentGame,
  setHighlightCurrentGame,
  showRecentGames,
  setShowRecentGames,
  numPlayers,
  setNumPlayers,
  countPosition,
  setCountPosition,
  generalOrder,
  setGeneralOrder,
  font,
  setFont,
  addEvent,
  timerState,
}: Props) {
  const [isShown, setIsShown] = useState(leftColor === rightColor);
  const { shouldShortenCast, setShouldShortenCast } = useShouldShortenContext();
  return (
    <>
      <Affix position={{ top: 6, right: 6 }}>
        <Button
          leftSection={<IconSettings size={16} />}
          onClick={() => setIsShown(true)}
          size="xs"
        >
          Tools
        </Button>
      </Affix>
      <Drawer.Root
        position="right"
        opened={isShown}
        onClose={() => setIsShown(false)}
        size={300}
        keepMounted={true}
      >
        <Drawer.Overlay backgroundOpacity={0} />
        <Drawer.Content style={{ boxShadow: "-0.2em 0 0.4em black" }}>
          <Drawer.Header>
            <Drawer.Title>Tools — Seed {seed}</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body p={0}>
            <Accordion
              multiple={true}
              defaultValue={leftColor === rightColor ? ["color"] : []}
            >
              <Accordion.Item value="color">
                <Accordion.Control>Select Colors</Accordion.Control>
                <Accordion.Panel>
                  <ColorSelector
                    label="Left player color"
                    color={leftColor}
                    setColor={setLeftColor}
                  />
                  <ColorSelector
                    label="Right player color"
                    color={rightColor}
                    setColor={setRightColor}
                  />
                  {((leftColor === "pink" && rightColor === "blue") ||
                    (leftColor === "blue" && rightColor === "pink")) && (
                      <Group mt={8} gap={4}>
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                        <img className={classes.emoji} src="/transflag.svg" />
                      </Group>
                    )}
                </Accordion.Panel>
              </Accordion.Item>
              <TimerSection
                timerState={timerState}
                addEvent={addEvent}
                seed={seed}
                isMobile={false}
              />
              <Accordion.Item value="display">
                <Accordion.Control>Display Settings</Accordion.Control>
                <Accordion.Panel>
                  <Stack>
                    <Stack>
                      <Checkbox
                        checked={shouldShortenCast}
                        onChange={(event) =>
                          setShouldShortenCast(
                            event.target.checked,
                          )
                        }
                        label="Show shortened goal text when available"
                      />
                      {shouldShortenCast && <Alert color="yellow" icon={<IconAlertSquareRounded />}>
                        Shortened goals may leave out important information.{' '}
                        You should only use shortened goal text if you are comfortable with the entire goal set.
                      </Alert>}
                      <Text size="sm">Display difficulty tags for:</Text>
                      {ORDERED_DIFFICULTY.map((difficulty) => (
                        <Checkbox
                          key={difficulty}
                          checked={shownDifficulties.includes(difficulty)}
                          onChange={(event) =>
                            setShownDifficulties(
                              event.currentTarget.checked
                                ? [...shownDifficulties, difficulty]
                                : shownDifficulties.filter(
                                  (d) => d !== difficulty,
                                ),
                            )
                          }
                          label={DIFFICULTY_NAMES[difficulty]}
                        />
                      ))}
                    </Stack>
                    <Select
                      label="Sort type"
                      data={[
                        { value: "fast", label: "Fastest" },
                        { value: "alphabetical", label: "Alphabetical" },
                        { value: "chronological", label: "Chronological" },
                      ]}
                      value={sortType}
                      onChange={(newSortType: string | null) =>
                        setSortType((newSortType ?? "fast") as SortType)
                      }
                    />
                    <GeneralOrderSelector
                      generalOrder={generalOrder}
                      setGeneralOrder={setGeneralOrder}
                    />
                    <Select
                      label="Icon type"
                      data={[
                        { value: "winnerbit", label: "WinnerBit" },
                        { value: "sprites", label: "Sprites" },
                        { value: "classic", label: "Classic" },
                      ]}
                      value={iconType}
                      onChange={(newIconType: string | null) =>
                        setIconType((newIconType ?? "winnerbit") as IconType)
                      }
                    />
                    <Select
                      label="Count position"
                      data={[
                        { value: "side_by_side", label: "Side-by-side" },
                        { value: "inset", label: "Inset" },
                      ]}
                      value={countPosition}
                      onChange={(newCountPosition: string | null) =>
                        setCountPosition(
                          (newCountPosition ??
                            "side_by_side") as TCountPosition,
                        )
                      }
                    />
                    <FontSelector font={font} setFont={setFont} />
                    <Checkbox
                      label="Hide board by default"
                      checked={hideByDefault}
                      onChange={(event) =>
                        setHideByDefault(event.target.checked)
                      }
                    />
                    <Checkbox
                      label="Show current game selectors"
                      checked={showGameSelector}
                      onChange={(event) =>
                        setShowGameSelector(event.target.checked)
                      }
                    />
                    <Checkbox
                      label="Highlight current game goals"
                      checked={highlightCurrentGame}
                      onChange={(event) =>
                        setHighlightCurrentGame(event.target.checked)
                      }
                    />
                    {showGameSelector && highlightCurrentGame && (
                      <NumberInput
                        label="Number of players"
                        description="General goals and recent games are only tracked for the first two players"
                        min={2}
                        max={8}
                        allowDecimal={false}
                        value={numPlayers}
                        onChange={(maybeStr) => {
                          if (
                            typeof maybeStr !== "number" ||
                            maybeStr < 2 ||
                            maybeStr > 8
                          ) {
                            return;
                          }
                          setNumPlayers(maybeStr);
                        }}
                      />
                    )}
                    <Checkbox
                      label="Show recent games"
                      checked={showRecentGames}
                      onChange={(event) =>
                        setShowRecentGames(event.target.checked)
                      }
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
              <NotificationsSection
                soundChoices={soundChoices}
                setSoundChoices={setSoundChoices}
              />
              <FileSyncSection
                leftScore={leftScore}
                rightScore={rightScore}
                generalCounts={generalCounts}
                generalGoals={generalGoals}
              />
              <CreateBoardSection id={id} isMobile={false} />
            </Accordion>
            <BottomSection id={id} isMobile={false} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
