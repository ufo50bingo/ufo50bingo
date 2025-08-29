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
import { Match } from "./Matches";
import { IconAlertSquareRounded, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { getBaseUrlAndStartSeconds, getVodLink, getWarning } from "./vodUtil";
import updateVod from "./updateVod";

type Props = {
  match: Match;
  onClose: () => void;
};

export default function EditVodModal({ match, onClose }: Props) {
  const oldVodLink = getVodLink(match) ?? "";
  const [newVodLink, setNewVodLink] = useState<string>(oldVodLink);
  const [isSaving, setIsSaving] = useState(false);

  const warning = getWarning(oldVodLink, newVodLink);
  return (
    <Modal
      centered={true}
      onClose={onClose}
      opened={true}
      title={`Edit VOD for ${match.name}`}
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
            color="red"
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
              try {
                setIsSaving(true);
                const [baseUrl, startSeconds] =
                  getBaseUrlAndStartSeconds(newVodLink);
                await updateVod(match.id, baseUrl, startSeconds);
                onClose();
              } finally {
                setIsSaving(false);
              }
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
