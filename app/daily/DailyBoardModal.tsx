import { Button, Modal, Stack } from "@mantine/core";
import { DailyFeedRow } from "../db";
import { IconClipboard } from "@tabler/icons-react";
import Board from "../Board";
import html2canvas from "html2canvas";
import { useMemo, useRef } from "react";
import getBoardAtIndex from "./getBoardAtIndex";
import { BingosyncColor, TBoard } from "../matches/parseBingosyncData";
import getDailyOverlays from "./getDailyOverlays";

type Props = {
    board: ReadonlyArray<string>;
    feedIndex: number;
    feedWithDuration: [number, DailyFeedRow][];
    isMobile: boolean;
    onClose: () => unknown;
    color: BingosyncColor;
};

export default function DailyBoardModal({ board: rawBoard, feedIndex, feedWithDuration, isMobile, onClose, color }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const board: TBoard = useMemo(() => {
        const boardMarked = getBoardAtIndex(feedWithDuration.map(item => item[1]), feedIndex);
        return rawBoard.map((name, index) => ({
            name,
            color: boardMarked[index] ? color : "blank",
        }));
    }, [feedWithDuration, color]);
    const overlays = useMemo(() => {
        return getDailyOverlays(feedIndex, feedWithDuration);
    }, [board, feedIndex, feedWithDuration])
    return (
        <Modal
            fullScreen={isMobile}
            centered={true}
            onClose={onClose}
            opened={true}
            size="auto"
            withCloseButton={true}
        >
            <Stack>
                <div ref={ref}>
                    <Board
                        board={board}
                        overlays={overlays}
                        onClickSquare={() => { }}
                        isHidden={false}
                        setIsHidden={() => { }}
                        shownDifficulties={[]}
                    />
                </div>
                <Button
                    leftSection={<IconClipboard size={16} />}
                    onClick={async () => {
                        const board = ref.current;
                        if (board == null) {
                            return;
                        }
                        const canvas = await html2canvas(board, {
                            onclone(cloneDoc, element) {
                                element.style.padding = "8px";
                                element.style.width = "541px";
                            },
                            backgroundColor: "rgb(36, 36, 36)",
                            scale: 4,
                        });
                        canvas.toBlob((blob) => {
                            if (blob == null) {
                                return;
                            }
                            const board = new ClipboardItem({ "image/png": blob });
                            navigator.clipboard.write([board]);
                        });
                    }}
                >
                    Copy to Clipboard
                </Button>
            </Stack>
        </Modal >
    )
}