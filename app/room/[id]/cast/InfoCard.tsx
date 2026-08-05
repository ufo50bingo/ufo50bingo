import { Card, Title } from "@mantine/core";
import { CSSProperties, ReactNode } from "react";

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  width?: null | undefined | number;
  maxWidth?: null | undefined | number;
  style?: CSSProperties,
};

export default function InfoCard({
  title,
  description,
  children,
  width = 268,
  maxWidth,
  style = {},
}: Props) {
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{
        width: maxWidth == null ? `${width}px` : undefined,
        maxWidth: maxWidth == null ? undefined : `${maxWidth}px`,
        resize: "both",
        ...style,
      }}
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
