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
  Stack,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import Countdown from "./Countdown";
import ColorSelector from "./ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";
import createNewCard from "./createNewCard";

type Props = {
  id: string;
  seed: number;
  leftColor: BingosyncColor;
  rightColor: BingosyncColor;
  setLeftColor: (newColor: BingosyncColor) => unknown;
  setRightColor: (newColor: BingosyncColor) => unknown;
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
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
}: Props) {
  const [isShown, setIsShown] = useState(leftColor === rightColor);
  const [isCreating, setIsCreating] = useState(false);
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
                <Countdown />
              </Card>
              <Card shadow="sm" padding="sm" radius="md" withBorder={true}>
                <Stack>
                  <span>Display difficulty tags for:</span>
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
              <Button onClick={() => setIsCreating(true)}>
                Create new board
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
              pages, especially if they are connected on multiple devices.
              <br />
              <br />
              Bingosync only allows each player to load the board once every 15
              seconds, so connecting from multiple devices may cause one or more
              devices to have stale data.
            </Alert>
            <Alert color="yellow" title="Are you sure?">
              This will create a new{" "}
              <strong>Standard lockout board with no customization</strong>. For
              other variants, create a new room or use the Bingosync page.
              <br />
              <br />
              Creating a new board will overwrite the existing board, and is not
              reversible. Are you sure you want to continue?
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
    </>
  );
}
