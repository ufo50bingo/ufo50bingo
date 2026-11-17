"use client";

import { Button, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../authClient";

type Props = {
  isAnonymous: boolean;
};

export default function SignOutButton({ isAnonymous }: Props) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  return (
    <Stack align="flex-start">
      <Button
        disabled={isSigningOut}
        onClick={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            router.refresh();
          } finally {
            setIsSigningOut(false);
          }
        }}
      >
        Sign out
      </Button>
      {isAnonymous && (
        <Text size="sm" c="dimmed">
          You signed in without Discord, so you won't be able to sign back in to
          this account.
        </Text>
      )}
    </Stack>
  );
}
