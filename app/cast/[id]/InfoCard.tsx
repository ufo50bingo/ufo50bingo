import { Card, Title } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export default function InfoCard({ title, children }: Props) {
  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder={true}
      style={{ height: "300px", flexBasis: "240px" }}
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
