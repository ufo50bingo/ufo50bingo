import { Box, Divider, Modal, ScrollArea } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  content: ReactNode;
  footer: ReactNode;
};

export default function ModalLayout({ content, footer }: Props) {
  return (
    <Modal.Body
      p={0}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "70vh",
      }}
    >
      <ScrollArea
        style={{
          flex: 1,
          minHeight: 0,
        }}
        p="sm"
      >
        {content}
      </ScrollArea>
      <Divider />
      <Box p="sm">{footer}</Box>
    </Modal.Body>
  );
}
