import { ReactNode, useEffect, useState } from "react";
import { Stack, Text } from "@mantine/core";

type Props = {
  endTime: number;
  intro: ReactNode;
};

export default function CountdownCoverContent({ endTime, intro }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      const newNow = Date.now();
      setNow(newNow);
      if (newNow >= endTime) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [endTime]);
  return endTime > now ? (
    <Stack align="center" gap={8}>
      {intro}
      <br />
      <Text style={{ fontVariantNumeric: "tabular-nums" }} size="xl">
        {((endTime - now) / 1000).toFixed(1)}
      </Text>
    </Stack>
  ) : null;
}
