import { Modal } from "@mantine/core";
import { LocalDate } from "./localDate";
import { DailyData } from "./page";
import { useMediaQuery } from "@mantine/hooks";
import EditDailyBody from "./EditDailyBody";
import { JSONContent } from "@tiptap/react";

type Props = {
  dailyData: DailyData;
  date: LocalDate;
  description: null | JSONContent;
  onClose: () => unknown;
};

export default function EditDaily({
  dailyData,
  date,
  description,
  onClose,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 525px)");
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
      <EditDailyBody
        date={date}
        dailyData={dailyData}
        description={description}
        onClose={onClose}
      />
    </Modal>
  );
}
