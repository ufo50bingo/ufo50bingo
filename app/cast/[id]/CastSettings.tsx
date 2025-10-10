import { ORDERED_DIFFICULTY, DIFFICULTY_NAMES, Difficulty } from "@/app/goals";
import {
  Affix,
  Alert,
  Button,
  Card,
  Checkbox,
  Drawer,
  Group,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import Countdown from "./Countdown";
import ColorSelector from "./ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import createNewCard from "./createNewCard";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconType, SortType } from "./useLocalState";

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
  setIsHidden: (newIsHidden: boolean) => unknown;
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
  setIsHidden,
}: Props) {
  const pathname = usePathname();

  const [isShown, setIsShown] = useState(leftColor === rightColor);
  const [isCreating, setIsCreating] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSavingNewCard, setIsSavingNewCard] = useState(false);

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
            <Drawer.Title>Tools</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Stack>
              <span>
                <strong>Seed: {seed}</strong>
              </span>
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
              <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
                <Countdown setIsHidden={setIsHidden} />
              </Card>
              <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
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
              </Card>
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
                onChange={event => setHideByDefault(event.target.checked)}
              />
              <Button color="green" onClick={() => setIsCreating(true)}>
                Create new board
              </Button>
              <Button color="red" onClick={() => setIsDisconnecting(true)}>
                Disconnect
              </Button>
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      {isCreating && (
        <Modal
          fullScreen={false}
          centered={true}
          onClose={() => setIsCreating(false)}
          opened={true}
          title="Create new board"
        >
          <Stack>
            <Alert title="Players may need to refresh">
              After creating a new card, players may need to refresh their
              pages, especially if they are connected on multiple devices or
              multiple windows.
              <br />
              <br />
              Bingosync rate-limits players, so connecting from multiple devices
              or multiple windows may cause the board to fail to refresh when a
              new card is generated, and players may see stale goals on one or
              more devices/windows when they reveal the card.
            </Alert>
            <Alert color="yellow" title="Are you sure?">
              This will create a new{" "}
              <strong>Standard lockout board with no customization</strong>. For
              other variants, create a new room or use the Bingosync page.
              <br />
              <br />
              Creating a new board will overwrite the existing board, and is not
              reversible. All data for the current board will be inaccessible on
              ufo50.bingo. Please only use this to correct a mistake! If you've
              already completed a game and want to start a new one, go to{" "}
              <Link href="/">Create Board</Link> and create a new board instead!
              <br />
              <br />
              Are you sure you want to continue?
            </Alert>
            <Group justify="end">
              <Button onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button
                disabled={isSavingNewCard}
                color="red"
                onClick={async () => {
                  setIsSavingNewCard(true);
                  try {
                    await createNewCard(id);
                    setIsCreating(false);
                  } finally {
                    setIsSavingNewCard(false);
                  }
                }}
              >
                Create new board
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
      {isDisconnecting && (
        <Modal
          fullScreen={false}
          centered={true}
          onClose={() => setIsCreating(false)}
          opened={true}
          title="Disconnect"
        >
          <Stack>
            <span>Are you sure you want to disconnect?</span>
            <Group justify="end">
              <Button onClick={() => setIsDisconnecting(false)}>Cancel</Button>
              <Button
                color="red"
                onClick={() => {
                  document.cookie = `sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${pathname};`;
                  window.location.reload();
                }}
              >
                Disconnect
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}
