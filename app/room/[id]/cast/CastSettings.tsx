import { ORDERED_DIFFICULTY, DIFFICULTY_NAMES, Difficulty } from "@/app/goals";
import {
  Accordion,
  Affix,
  Button,
  Checkbox,
  Drawer,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import ColorSelector from "../common/ColorSelector";
import { BingosyncColor, Square } from "@/app/matches/parseBingosyncData";
import { IconType, SortType } from "./useLocalState";
import { Ding } from "../play/useDings";
import NotificationsSection from "../common/NotificationsSection";
import CreateBoardSection from "../common/CreateBoardSection";
import RequestPauseSection from "../common/RequestPauseSection";
import CountdownSection from "../common/CountdownSection";
import BottomSection from "../common/BottomSection";
import FileSyncSection from "./FileSyncSection";
import { GeneralCounts } from "./CastPage";

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
  dings: ReadonlyArray<Ding>;
  setDings: (newDings: ReadonlyArray<Ding>) => unknown;
  leftScore: number;
  rightScore: number;
  generalCounts: GeneralCounts;
  generalGoals: ReadonlyArray<Square>;
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
  dings,
  setDings,
  leftScore,
  rightScore,
  generalCounts,
  generalGoals,
}: Props) {
  const [isShown, setIsShown] = useState(leftColor === rightColor);

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
            <Accordion multiple={true} defaultValue={leftColor === rightColor ? ["color"] : []}>
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
                </Accordion.Panel>
              </Accordion.Item>
              <CountdownSection view="cast" />
              <RequestPauseSection id={id} />
              <Accordion.Item value="display">
                <Accordion.Control>
                  Display Settings
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack>
                    <Stack>
                      <Text size="sm">Display difficulty tags for:</Text>
                      {ORDERED_DIFFICULTY.map((difficulty) => (
                        <Checkbox
                          key={difficulty}
                          checked={shownDifficulties.includes(difficulty)}
                          onChange={(event) =>
                            setShownDifficulties(
                              event.currentTarget.checked
                                ? [...shownDifficulties, difficulty]
                                : shownDifficulties.filter((d) => d !== difficulty)
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
                    <Select
                      label="Icon type"
                      data={[
                        { value: "winnerbit", label: "WinnerBit" },
                        { value: "sprites", label: "Sprites" },
                      ]}
                      value={iconType}
                      onChange={(newIconType: string | null) =>
                        setIconType((newIconType ?? "winnerbit") as IconType)
                      }
                    />
                    <Checkbox
                      label="Hide board by default"
                      checked={hideByDefault}
                      onChange={(event) => setHideByDefault(event.target.checked)}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
              <NotificationsSection dings={dings} setDings={setDings} />
              <FileSyncSection id={id} leftScore={leftScore} rightScore={rightScore} generalCounts={generalCounts} generalGoals={generalGoals} />
              <CreateBoardSection id={id} />
            </Accordion>
            <BottomSection id={id} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
