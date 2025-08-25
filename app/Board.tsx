import { useState } from 'react';
import { Center } from '@mantine/core';
import SquareText from './SquareText';
import classes from './Board.module.css';

type Props = {
  rows: ReadonlyArray<ReadonlyArray<string>>;
};

export default function Board({ rows }: Props) {
  const [isHidden, setIsHidden] = useState(true);
  const [selectedIndices, setSelectedIndices] = useState<ReadonlyArray<ReadonlyArray<boolean>>>(
    rows.map((row) => row.map((cell) => false))
  );
  return (
    <div className={classes.boardContainer}>
      <table className={classes.baseTable}>
        <colgroup>
          <col style={{ width: '105px' }} />
          <col style={{ width: '105px' }} />
          <col style={{ width: '105px' }} />
          <col style={{ width: '105px' }} />
          <col style={{ width: '105px' }} />
        </colgroup>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr style={{ height: '95px' }} key={rowIndex}>
              {row.map((goal, cellIndex) => (
                <td
                  key={cellIndex}
                  className={
                    selectedIndices[rowIndex][cellIndex]
                      ? `${classes.unselectable} ${classes.square} ${classes.redsquare}`
                      : `${classes.unselectable} ${classes.square} ${classes.blanksquare}`
                  }
                  onClick={() => {
                    const newRow = [...selectedIndices[rowIndex]];
                    newRow[cellIndex] = !newRow[cellIndex];
                    const newSelectedIndices = [...selectedIndices];
                    newSelectedIndices[rowIndex] = newRow;
                    setSelectedIndices(newSelectedIndices);
                  }}
                >
                  <Center h={85}>
                    <SquareText text={goal} />
                  </Center>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isHidden && (
        <div
          className={`${classes.boardCover} ${classes.unselectable}`}
          onClick={() => setIsHidden(false)}
        >
          <span>Click to Reveal</span>
        </div>
      )}
    </div>
  );
}
