import { HoverCard } from '@mantine/core';
import { VariantMetadata } from './pastas/metadata';

type Props = {
  metadata: VariantMetadata;
};

export default function VariantHoverCard({ metadata }: Props) {
  return (
    <HoverCard width={metadata.isMenu ? 450 : 600} shadow="md" openDelay={500}>
      <HoverCard.Target>
        <span>{metadata.name}</span>
      </HoverCard.Target>
      <HoverCard.Dropdown>{metadata.hovercard}</HoverCard.Dropdown>
    </HoverCard>
  );
}
