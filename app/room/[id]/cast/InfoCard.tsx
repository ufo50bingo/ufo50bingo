import { Card, Title } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  height?: null | undefined | number;
  width?: null | undefined | number;
};

export default function InfoCard({
  title,
  description,
  children,
  height,
  width = 268,
}: Props) {
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ height: `${height ?? 300}px`, width: `${width}px`, resize: "both" }}
    >
      {title != null && (
        <Card.Section inheritPadding={true} withBorder={true} py="sm">
          <Title order={5}>{title}</Title>
          <span style={{ fontSize: "12px" }}>{description}</span>
        </Card.Section>
      )}
      <Card.Section
        inheritPadding={true}
        withBorder={true}
        py="sm"
        style={{ overflowY: "auto" }}
      >
        {children}
      </Card.Section>
    </Card>
  );
}
