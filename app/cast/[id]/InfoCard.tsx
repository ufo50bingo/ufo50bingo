import { Card, Title } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
  height: null | undefined | number;
  width?: null | undefined | number;
};

export default function InfoCard({ title, children, height, width = 268 }: Props) {
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ height: `${height ?? 300}px`, flexBasis: `${width ?? 268}px` }}
    >
      <Card.Section inheritPadding={true} withBorder={true} py="sm">
        <Title order={5}>{title}</Title>
      </Card.Section>
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
