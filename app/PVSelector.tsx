import { Tooltip, Select } from "@mantine/core";
import {
  PRACTICE_VARIANTS,
  PracticeVariant,
  usePracticeVariant,
} from "./PracticeVariantContext";
import { useRouter } from "next/navigation";

export default function PVSelector() {
  const practiceVariant = usePracticeVariant();
  return (
    <Tooltip label="Used on the Practice and All Goals tabs">
      <div
        style={{
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {practiceVariant == null ? (
          <Select value="" data={[]} label="Practice Variant" />
        ) : (
          <Inner practiceVariant={practiceVariant} />
        )}
      </div>
    </Tooltip>
  );
}

function Inner({ practiceVariant: pv }: { practiceVariant: PracticeVariant }) {
  const router = useRouter();
  return (
    <Select
      value={pv}
      onChange={(newValue) => {
        const url = new URL(window.location.href);
        if (newValue !== "standard" && newValue) {
          url.searchParams.set("v", newValue);
        } else {
          url.searchParams.delete("v");
        }
        router.push(url.toString());
      }}
      data={Object.keys(PRACTICE_VARIANTS).map((key) => ({
        value: key,
        label: PRACTICE_VARIANTS[key as keyof typeof PRACTICE_VARIANTS],
      }))}
      label="Practice Variant"
    />
  );
}
