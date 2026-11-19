import { Menu } from "@mantine/core";
import {
  IconCheck,
  IconLayoutColumns,
  IconLetterCase,
  IconPhoto,
  IconTags,
  IconTypography,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import { DIFFICULTY_NAMES, Difficulty, ORDERED_DIFFICULTY } from "../goals";
import { IconType } from "../room/[id]/cast/useLocalState";
import { TCountPosition } from "../room/[id]/cast/useCountPosition";
import { Font } from "../font/useFont";

type Props = {
  shownDifficulties: ReadonlyArray<Difficulty>;
  setShownDifficulties: (newShown: ReadonlyArray<Difficulty>) => unknown;
  countPosition: TCountPosition;
  setCountPosition: (newCountPosition: TCountPosition) => unknown;
  iconType: IconType;
  setIconType: (newIconType: IconType) => unknown;
  shouldShorten: boolean;
  setShouldShorten: (newShouldShorten: boolean) => unknown;
  font: Font;
  setFont: (newFont: Font) => unknown;
};

export default function MatchDisplaySubmenus({
  shownDifficulties,
  setShownDifficulties,
  countPosition,
  setCountPosition,
  iconType,
  setIconType,
  shouldShorten,
  setShouldShorten,
  font,
  setFont,
}: Props) {
  return (
    <>
      <Submenu icon={<IconTags size={16} />} label="Difficulty tags">
        {ORDERED_DIFFICULTY.map((difficulty) => {
          const isShown = shownDifficulties.includes(difficulty);
          return (
            <OptionItem
              key={difficulty}
              isSelected={isShown}
              onClick={() =>
                setShownDifficulties(
                  isShown
                    ? shownDifficulties.filter((d) => d !== difficulty)
                    : [...shownDifficulties, difficulty],
                )
              }
            >
              {DIFFICULTY_NAMES[difficulty]}
            </OptionItem>
          );
        })}
      </Submenu>
      <Submenu icon={<IconLayoutColumns size={16} />} label="Count position">
        <OptionItem
          isSelected={countPosition === "side_by_side"}
          onClick={() => setCountPosition("side_by_side")}
        >
          Side-by-side
        </OptionItem>
        <OptionItem
          isSelected={countPosition === "inset"}
          onClick={() => setCountPosition("inset")}
        >
          Inset
        </OptionItem>
      </Submenu>
      <Submenu icon={<IconPhoto size={16} />} label="Icon type">
        <OptionItem
          isSelected={iconType === "winnerbit"}
          onClick={() => setIconType("winnerbit")}
        >
          WinnerBit
        </OptionItem>
        <OptionItem
          isSelected={iconType === "sprites"}
          onClick={() => setIconType("sprites")}
        >
          Sprites
        </OptionItem>
        <OptionItem
          isSelected={iconType === "classic"}
          onClick={() => setIconType("classic")}
        >
          Classic
        </OptionItem>
      </Submenu>
      <Submenu icon={<IconLetterCase size={16} />} label="Goal text">
        <OptionItem
          isSelected={!shouldShorten}
          onClick={() => setShouldShorten(false)}
        >
          Full
        </OptionItem>
        <OptionItem
          isSelected={shouldShorten}
          onClick={() => setShouldShorten(true)}
        >
          Shortened when available
        </OptionItem>
      </Submenu>
      <Submenu icon={<IconTypography size={16} />} label="Font">
        <OptionItem
          isSelected={font === "default"}
          onClick={() => setFont("default")}
        >
          Default
        </OptionItem>
        <OptionItem
          isSelected={font === "ufo50"}
          onClick={() => setFont("ufo50")}
        >
          UFO 50
        </OptionItem>
      </Submenu>
    </>
  );
}

function Submenu({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Menu.Sub>
      <Menu.Sub.Target>
        <Menu.Sub.Item leftSection={icon}>{label}</Menu.Sub.Item>
      </Menu.Sub.Target>
      <Menu.Sub.Dropdown>{children}</Menu.Sub.Dropdown>
    </Menu.Sub>
  );
}

function OptionItem({
  isSelected,
  onClick,
  children,
}: {
  isSelected: boolean;
  onClick: () => unknown;
  children: ReactNode;
}) {
  return (
    <Menu.Item
      closeMenuOnClick={false}
      leftSection={
        isSelected ? <IconCheck size={16} /> : <div style={{ width: 16 }} />
      }
      onClick={onClick}
    >
      {children}
    </Menu.Item>
  );
}
