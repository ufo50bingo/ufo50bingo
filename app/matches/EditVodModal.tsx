import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  Space,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconAlertSquareRounded, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { getBaseUrlAndStartSeconds, getVodLink, getWarning } from "./vodUtil";
import runWithMaybeRefresh from "./runWithMaybeRefresh";
import { useRouter } from "next/navigation";
import { FullParsedGame } from "../fetchFeed";

type Props = {
  matchesUrl: string | null;
  isMobile: boolean;
  match: FullParsedGame;
  onClose: () => void;
};

export default function EditVodModal({
  matchesUrl,
  isMobile,
  match,
  onClose,
}: Props) {
  const router = useRouter();
  const vod = match.game.vod;
  const oldVodLink = vod != null ? getVodLink(vod, 0) : "";
  const [newVodLink, setNewVodLink] = useState<string>(oldVodLink);
  const [isSaving, setIsSaving] = useState(false);

  const warning = getWarning(oldVodLink, newVodLink);
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
      opened={true}
      title={`Edit VOD for ${match.game.name}`}
      size={800}
    >
      <p>
        Paste a link to the VOD, with a timestamp for when the match begins. To
        be specific, this is when <strong>the review period ends</strong> and
        players start working on their first goal.
      </p>
      <p>
        To get this link, <strong>pause the VOD the start of the match</strong>{" "}
        and then
      </p>
      <List>
        <List.Item>
          <strong>Youtube:</strong> Right click anywhere on the video and choose
          "Copy video URL at current time"
        </List.Item>
        <List.Item>
          <strong>Twitch</strong>: Click the <IconSettings size={14} /> Gear
          icon and choose "Copy URL at 0:00:00" (with your desired time)
        </List.Item>
      </List>
      <Space h="lg" />
      <Stack>
        <TextInput
          value={newVodLink}
          onChange={(event) => setNewVodLink(event.target.value)}
          placeholder="Example: https://youtu.be/CLreXQuyzjs?t=759"
        />
        {warning != null && (
          <Alert
            variant="light"
            color="yellow"
            title={warning[0]}
            icon={<IconAlertSquareRounded />}
          >
            {warning[1]}
          </Alert>
        )}
        <Group mt="lg" justify="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={oldVodLink === newVodLink || isSaving}
            onClick={async () => {
              setIsSaving(true);
              await runWithMaybeRefresh(
                router,
                matchesUrl,
                async () => {
                  const [baseUrl, startSeconds] =
                    getBaseUrlAndStartSeconds(newVodLink);
                  // TODO: Fix updateVod
                  // await updateVod(match.id, baseUrl, startSeconds);
                  onClose();
                  return true;
                },
                () => setIsSaving(false),
              );
            }}
            color="green"
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
