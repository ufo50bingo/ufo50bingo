import { Accordion, Alert, Button, Stack } from "@mantine/core";

type Props = {
    forceReveal: () => unknown;
}

export default function RevealSection({ forceReveal }: Props) {
    return (
        <>
            <Accordion.Item value="reveal">
                <Accordion.Control>Reveal Board</Accordion.Control>
                <Accordion.Panel>
                    <Stack>
                        <Alert color="yellow" title="WARNING!">
                            The board will be automatically revealed a few seconds after the "Start" button is clicked. Are you sure you want to reveal the board early?
                        </Alert>
                        <Button onClick={forceReveal}>Reveal Board</Button>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </>
    );
}