import { Checkbox, Group, SimpleGrid, Text } from "@mantine/core";
import { Game, GAME_NAMES, ORDERED_PROPER_GAMES } from "../goals";

type Props = {
    numPlayers: number;
    draftCheckState: Map<Game, null | number>;
    setDraftCheckState: (newCheckState: Map<Game, null | number>) => void;
};

export default function DraftChecker({ draftCheckState, setDraftCheckState, numPlayers }: Props) {
    return (
        <>
            <Text>
                <strong>Select drafted games for each player</strong>
            </Text>
            <SimpleGrid cols={3}>
                {Array.from(
                    draftCheckState.entries().map(([game, checkedPlayer]) => (
                        <Group key={game}>
                            {Array(numPlayers).fill(null).map((_, playerIndex) => (
                                <Checkbox
                                    key={playerIndex}
                                    checked={checkedPlayer === playerIndex}
                                    onChange={(event) => {
                                        const newState = new Map(draftCheckState);
                                        newState.set(
                                            game,
                                            event.currentTarget.checked
                                                ? playerIndex
                                                : null,
                                        );
                                        setDraftCheckState(newState);
                                    }}
                                />
                            ))}
                            <Text size="sm">{GAME_NAMES[game]}</Text>
                        </Group>
                    ))
                )}
            </SimpleGrid>
        </>
    );
}
