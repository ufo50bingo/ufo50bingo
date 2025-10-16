"use client";

import Board from "@/app/Board";
import { fetchBoard } from "@/app/fetchMatchInfo";
import {
    BingosyncColor,
    getBoard,
    RawFeed,
    RawFeedItem,
    TBoard,
} from "@/app/matches/parseBingosyncData";
import { Button, Group, Modal, Stack } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import changeColor from "@/app/cast/[id]/changeColor";
import Feed from "@/app/cast/[id]/Feed";

export type CastProps = {
    id: string;
    board: TBoard;
    rawFeed: RawFeed;
    socketKey: string;
    initialSeed: number;
};

export default function Play({
    id,
    board: initialBoard,
    rawFeed: initialRawFeed,
    socketKey,
    initialSeed,
}: CastProps) {
    const [color, setColor] = useState<BingosyncColor>('red');
    const [seed, setSeed] = useState(initialSeed);

    const [isHidden, setIsHidden] = useState(true);
    const [board, setBoard] = useState(initialBoard);
    const [rawFeed, setRawFeed] = useState(initialRawFeed);
    const [shouldReconnect, setShouldReconnect] = useState(false);
    const socketRef = useRef<null | WebSocket>(null);

    useEffect(() => {
        const socket = new WebSocket("wss://sockets.bingosync.com/broadcast");

        socket.onopen = () => {
            socket.send(JSON.stringify({ socket_key: socketKey }));
            setShouldReconnect(false);
        };

        socket.onclose = () => {
            console.log("*** Disconnected from server, try refreshing. ***");
            setTimeout(() => {
                if (
                    socketRef.current == null ||
                    socketRef.current.readyState !== socketRef.current.OPEN
                ) {
                    setShouldReconnect(true);
                }
            }, 1000);
        };

        socket.onmessage = async (evt) => {
            const rawItem: RawFeedItem = JSON.parse(evt.data);
            setRawFeed((prevRawFeed) => ({
                events: [...prevRawFeed.events, rawItem],
                allIncluded: true,
            }));

            if (rawItem.type === "goal") {
                setBoard((prevBoard) => {
                    const newBoard = [...prevBoard];
                    const slot = rawItem.square.slot;
                    const color = rawItem.square.colors;
                    const slotIndex = Number(slot.slice(4)) - 1;

                    const square = { ...prevBoard[slotIndex], color };
                    newBoard[slotIndex] = square;
                    return newBoard;
                });
            } else if (rawItem.type === "new-card") {
                setSeed(rawItem.seed);
                const rawBoard = await fetchBoard(id);
                const newBoard = getBoard(rawBoard);
                setBoard(newBoard);
            }
        };

        socketRef.current = socket;

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [socketKey, id]);

    return (
        <>
            <Group>
                <Board
                    board={board}
                    onClickSquare={async (squareIndex) => {
                        const isClearing = board[squareIndex].color === color;
                        try {
                            await changeColor(id, squareIndex, color, isClearing);
                        } catch { }
                    }}
                    isHidden={isHidden}
                    setIsHidden={setIsHidden}
                    shownDifficulties={[]}
                    hiddenText="Click or start Countdown to reveal"
                />
                <Feed rawFeed={rawFeed} />
            </Group>
            {
                shouldReconnect && (
                    <Modal
                        fullScreen={false}
                        centered={true}
                        onClose={() => setShouldReconnect(false)}
                        opened={true}
                        title="Reconnection needed"
                    >
                        <Stack>
                            <span>
                                You have been disconnected from Bingosync! Please refresh your
                                page.
                            </span>
                            <Group justify="end">
                                <Button onClick={() => setShouldReconnect(false)}>Ignore</Button>
                                <Button
                                    color="green"
                                    onClick={() => {
                                        window.location.reload();
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Group>
                        </Stack>
                    </Modal>
                )
            }
        </>
    );
}
