import { Modal } from "@mantine/core";
import { LocalDate } from "./localDate";
import { DailyData } from "./page";
import { useMediaQuery } from "@mantine/hooks";
import EditDailyBody from "./EditDailyBody";
import { JSONContent } from "@tiptap/react";
import { PracticeVariant } from "../PracticeVariantContext";

type Props = {
  dailyData: DailyData;
  date: LocalDate;
  description: null | JSONContent;
  onClose: () => unknown;
  variant: PracticeVariant;
};

export default function EditDaily({
  dailyData,
  date,
  description,
  onClose,
  variant,
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
        variant={variant}
      />
    </Modal>
  );
}
