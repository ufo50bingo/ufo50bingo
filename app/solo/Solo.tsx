"use client";

import { useEffect, useMemo, useState } from "react";
import { decodeGoalList, encodeGoalList } from "./encodeDecode";
import { Button, Stack } from "@mantine/core";
import ufoGenerator from "../generator/ufoGenerator";
import { STANDARD_UFO } from "../pastas/standardUfo";

export default function Solo() {
    const [board, setBoard] = useState<ReadonlyArray<string>>(Array(25).fill(" "));

    useEffect(() => {
        const handleHashChange = async () => {
            const hash = window.location.hash.slice(1);
            if (hash != null && hash !== "") {
                setBoard(await decodeGoalList(hash));
            }
        };

        handleHashChange();

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    return (
        <Stack>
            <Button onClick={async () => {
                const newBoard = ufoGenerator(STANDARD_UFO);
                const encoded = await encodeGoalList(newBoard);
                window.history.pushState(null, "", `#${encoded}`);
                setBoard(newBoard);
            }}>Generate new</Button>
            <div>{board}</div>
        </Stack>
    )
}