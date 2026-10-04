"use client";

import { useRowLabel } from "@payloadcms/ui";

// Label collapsed array rows with their content instead of "Card 01", "Card 02".
export function TitleRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>();
  return <span>{data?.title || `Item ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}</span>;
}

export function LabelRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; value?: number; suffix?: string }>();
  return <span>{data?.label ? `${data.value ?? ""}${data.suffix ?? ""} ${data.label}` : `Item ${String((rowNumber ?? 0) + 1).padStart(2, "0")}`}</span>;
}
