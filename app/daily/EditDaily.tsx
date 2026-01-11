import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { LocalDate } from "./localDate";
import { DailyData } from "./page";
import { useMediaQuery } from "@mantine/hooks";
import EditDailyBody from "./EditDailyBody";
import useLocalString from "../localStorage/useLocalString";
import { JSONContent } from "@tiptap/react";

type Props = {
  dailyData: DailyData;
  date: LocalDate;
  description: null | JSONContent;
  onClose: () => unknown;
};

const SECRET_PASSWORD_NO_PEEKING = "pleaseletmeeditthedailybingoboard";

export default function EditDaily({
  dailyData,
  date,
  description,
  onClose,
}: Props) {
  const [password, setPassword] = useLocalString({
    key: "daily-password",
    defaultValue: "",
  });
  const isMobile = useMediaQuery("(max-width: 525px)");
  const body =
    password === SECRET_PASSWORD_NO_PEEKING ? (
      <EditDailyBody
        date={date}
        dailyData={dailyData}
        description={description}
        onClose={onClose}
      />
    ) : (
      <Stack>
        <Text>
          You must provide a password to edit the Daily Bingo. If you want to
          contribute, please reach out to Frank on Discord.
        </Text>
        <TextInput
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Group justify="end">
          <Button onClick={onClose}>Cancel</Button>
        </Group>
      </Stack>
    );
  return (
    <Modal
      fullScreen={isMobile}
      centered={true}
      onClose={onClose}
      opened={true}
      size="lg"
      withCloseButton={true}
      title={`Edit Daily Bingo ${date.month}/${date.day}`}
    >
      {body}
    </Modal>
  );
}
