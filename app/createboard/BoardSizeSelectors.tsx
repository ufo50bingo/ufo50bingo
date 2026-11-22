import { Checkbox, Group, NumberInput, Stack, Text } from "@mantine/core";
import { BoardSize } from "./NonLeagueMatch";

type Props = {
  boardSize: BoardSize;
  setBoardSize: (newBoardSize: BoardSize) => unknown;
};

export default function BoardSizeSelectors({ boardSize, setBoardSize }: Props) {
  const setRows = (newVal: number) => {
    const newBoardSize = { ...boardSize };
    newBoardSize.rows = newVal;
    if (boardSize.lockSquare) {
      newBoardSize.cols = newVal;
    }
    setBoardSize(newBoardSize);
  };
  const setCols = (newVal: number) => {
    const newBoardSize = { ...boardSize };
    newBoardSize.cols = newVal;
    if (boardSize.lockSquare) {
      newBoardSize.rows = newVal;
    }
    setBoardSize(newBoardSize);
  };
  const setLockSquare = (newVal: boolean) => {
    const newBoardSize = { ...boardSize };
    if (newVal) {
      newBoardSize.cols = newBoardSize.rows;
    }
    setBoardSize(newBoardSize);
  };
  return (
    <Stack>
      <Text>
        <strong>Choose board size</strong>
      </Text>
      <Group align="center">
        <SizeInput label="Rows" val={boardSize.rows} setVal={setRows} />
        <SizeInput label="Cols" val={boardSize.cols} setVal={setCols} />
        <Checkbox
          label="Lock to square"
          checked={boardSize.lockSquare}
          onChange={(e) => setLockSquare(e.target.checked)}
          mt={24}
        />
      </Group>
    </Stack>
  );
}

type SizeInputProps = {
  val: number;
  setVal: (newNum: number) => unknown;
  label: string;
};

function SizeInput({ val, setVal, label }: SizeInputProps) {
  return (
    <NumberInput
      label={label}
      value={val}
      onChange={(newVal: string | number) => {
        if (typeof newVal === "number") {
          setVal(newVal);
        }
      }}
      min={1}
      max={15}
      allowDecimal={false}
      allowNegative={false}
    />
  );
}
