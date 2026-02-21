import { Select } from "@mantine/core";

export const GENERAL_ORDER = ["reading", "stable"] as const;
export type TGeneralOrder = (typeof GENERAL_ORDER)[number];

type Props = {
  generalOrder: TGeneralOrder;
  setGeneralOrder: (order: TGeneralOrder) => unknown;
};

export default function GeneralOrderSelector({
  generalOrder,
  setGeneralOrder,
}: Props) {
  return (
    <Select
      label="Icon order"
      data={[
        { label: "Reading", value: "reading" },
        { label: "Stable", value: "stable" },
      ]}
      value={generalOrder}
      onChange={(newOrder) => setGeneralOrder(newOrder as TGeneralOrder)}
    />
  );
}
