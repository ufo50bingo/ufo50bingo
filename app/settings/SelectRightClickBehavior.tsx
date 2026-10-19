import {
  ActionIcon,
  Button,
  ColorPicker,
  Input,
  List,
  Select,
  Stack,
} from "@mantine/core";
import { RightClickBehavior } from "./useRightClickBehavior";
import { useRightClickBehaviorContext } from "./RightClickBehaviorContext";
import { useAppContext } from "../AppContextProvider";
import { IconX } from "@tabler/icons-react";
import React from "react";

type Props = {
  label?: string;
  isCast: boolean;
};

const CAST_DATA = [
  { value: "star", label: "Star" },
  { value: "left_hold", label: "Held by left player" },
  { value: "right_hold", label: "Held by right player" },
];

const OTHER_DATA = [
  { value: "star", label: "Star" },
  { value: "my_color", label: "Highlight in my color" },
  { value: "custom_color", label: "Highlight in custom color" },
];

export default function SelectRightClickBehavior({ label, isCast }: Props) {
  const {
    rightClickBehavior,
    setRightClickBehavior,
    customColor,
    setCustomColor,
  } = useRightClickBehaviorContext();
  const { isMounted } = useAppContext();
  return (
    <Input.Wrapper label={label}>
      <Stack gap={16}>
        <List spacing="sm" size="sm" listStyleType="none">
          {rightClickBehavior.map((behavior, idx) => (
            <List.Item
              key={idx}
              icon={
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    if (rightClickBehavior.length < 2) {
                      return;
                    }
                    setRightClickBehavior(
                      rightClickBehavior.filter((_, i) => i !== idx),
                    );
                  }}
                  disabled={rightClickBehavior.length < 2}
                >
                  <IconX stroke={2} size={16} />
                </ActionIcon>
              }
              styles={{
                itemWrapper: { alignItems: "flex-start" },
                itemIcon: { marginTop: "4px" },
              }}
            >
              <Stack gap={4}>
                <Select
                  value={behavior.type}
                  data={isCast ? CAST_DATA : OTHER_DATA}
                  onChange={(value) => {
                    const typed = value as RightClickBehavior["type"];
                    switch (typed) {
                      case "star":
                        setRightClickBehavior(
                          updateAt(rightClickBehavior, { type: "star" }, idx),
                        );
                        break;
                      case "left_hold":
                        setRightClickBehavior(
                          updateAt(rightClickBehavior, { type: "left_hold" }, idx),
                        );
                        break;
                      case "right_hold":
                        setRightClickBehavior(
                          updateAt(rightClickBehavior, { type: "right_hold" }, idx),
                        );
                        break;
                      case "my_color":
                        setRightClickBehavior(
                          updateAt(
                            rightClickBehavior,
                            { type: "my_color" },
                            idx,
                          ),
                        );
                        break;
                      case "custom_color":
                        setRightClickBehavior(
                          updateAt(
                            rightClickBehavior,
                            { type: "custom_color", color: customColor },
                            idx,
                          ),
                        );
                        break;
                    }
                  }}
                />
                {isMounted && behavior.type === "custom_color" && (
                  <ColorPicker
                    w={208}
                    value={behavior.color}
                    onChange={(newColor: string) => {
                      setCustomColor(newColor);
                      setRightClickBehavior(
                        updateAt(
                          rightClickBehavior,
                          { type: "custom_color", color: newColor },
                          idx,
                        ),
                      );
                    }}
                  />
                )}
              </Stack>
            </List.Item>
          ))}
          <List.Item>
            <Button
              onClick={() =>
                setRightClickBehavior([...rightClickBehavior, { type: "star" }])
              }
            >
              Add item
            </Button>
          </List.Item>
        </List>
      </Stack>
    </Input.Wrapper>
  );
}

function updateAt(
  oldBehaviors: ReadonlyArray<RightClickBehavior>,
  newBehavior: RightClickBehavior,
  idx: number,
): ReadonlyArray<RightClickBehavior> {
  const newBehaviors = [...oldBehaviors];
  newBehaviors[idx] = newBehavior;
  return newBehaviors;
}
