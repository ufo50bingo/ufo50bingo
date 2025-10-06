import { ORDERED_DIFFICULTY, DIFFICULTY_NAMES, Difficulty } from "@/app/goals";
import { Affix, Button, Card, Checkbox, Drawer, Stack } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import Countdown from "./Countdown";
import ColorSelector from "./ColorSelector";
import { BingosyncColor } from "@/app/matches/parseBingosyncData";

type Props = {
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
};

export default function CastSettings({
  shownDifficulties,
  setShownDifficulties,
}: Props) {
  const [isShown, setIsShown] = useState(true);
  const [leftColor, setLeftColor] = useState<BingosyncColor>("red");
  const [rightColor, setRightColor] = useState<BingosyncColor>("red");

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
            </Stack>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
