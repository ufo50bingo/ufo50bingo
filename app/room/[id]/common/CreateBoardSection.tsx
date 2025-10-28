import { Accordion, Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import createNewCard from "../cast/createNewCard";

type Props = {
    id: string;
};

export default function CreateBoardSection({ id }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [isSavingNewCard, setIsSavingNewCard] = useState(false);
    return (
        <>
            <Accordion.Item value="createboard">
                <Accordion.Control>
                    Create New Board
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack>
                        <Text size="sm">
                            This will create a new <strong>Standard lockout board with no customization</strong>. For
                            other variants, create a new room or use the Bingosync page.
                        </Text>
                        <Button color="green" onClick={() => setIsCreating(true)}>
                            Create new board
                        </Button>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
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
        </>
    );
}