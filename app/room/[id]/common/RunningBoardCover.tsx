import { useEffect, useState } from "react";
import { Stack, Text } from "@mantine/core";

type Props = {
  curStartTime: number;
  onReveal: () => Promise<void>;
};

export default function RunningBoardCover({ curStartTime, onReveal }: Props) {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const firstNow = Date.now();
    const interval = setInterval(() => {
      const newNow = Date.now();
      setNow(newNow);
      if (newNow >= curStartTime) {
        clearInterval(interval);
        if (firstNow < curStartTime) {
          onReveal();
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [curStartTime, onReveal]);
  return curStartTime > now ? (
    <Stack align="center" gap={8}>
      Automatic reveal in
      <br />
      <Text
        style={{ fontVariantNumeric: "tabular-nums" }}
        size="xl"
      >
        {((curStartTime - now) / 1000).toFixed(1)}
      </Text>
    </Stack>
  ) : null;
}
