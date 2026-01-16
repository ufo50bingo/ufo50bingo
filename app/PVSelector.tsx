import { Tooltip, Select } from "@mantine/core";
import {
  PRACTICE_VARIANTS,
  usePracticeVariant,
} from "./PracticeVariantContext";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function PVSelector() {
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
        <Suspense
          fallback={<Select value="" data={[]} label="Practice Variant" />}
        >
          <Inner />
        </Suspense>
      </div>
    </Tooltip>
  );
}

function Inner() {
  const router = useRouter();
  const pv = usePracticeVariant();
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
