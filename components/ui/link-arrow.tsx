import { ArrowRight, ArrowUpRight } from "lucide-react";

/** SVG arrows keep links consistent across desktop and mobile font renderers. */
export function LinkArrow({ direction = "up-right" }: { direction?: "right" | "up-right" }) {
  const Icon = direction === "right" ? ArrowRight : ArrowUpRight;
  return <Icon size="1em" strokeWidth={1.75} aria-hidden="true" focusable="false" style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }} />;
}
