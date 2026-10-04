import type { CSSProperties, ReactNode } from "react";
import "./pixel-arrow-button.css";

// A chunky pixel chevron on a 4×5 grid, lit column by column.
const CHEVRON: Array<[number, number]> = [
  [0, 0], [1, 0],
  [1, 1], [2, 1],
  [2, 2], [3, 2],
  [1, 3], [2, 3],
  [0, 4], [1, 4],
];

const ROW_LENGTH = 7;

function PixelChevron({ index = 0 }: { index?: number }) {
  return (
    <svg className="pab-chevron" viewBox="0 0 4 5" style={{ "--chevron": index } as CSSProperties} aria-hidden="true">
      {CHEVRON.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.12} y={y + 0.12} width={0.76} height={0.76} rx={0.14} style={{ "--col": x } as CSSProperties} />
      ))}
    </svg>
  );
}

type PixelArrowButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  direction?: "right" | "down";
  external?: boolean;
  className?: string;
};

/** Split button: a pixel-arrow panel that sweeps across the label on hover and runs a wave of arrows. */
export function PixelArrowButton({ href, children, variant = "primary", direction = "right", external, className }: PixelArrowButtonProps) {
  return (
    <a
      className={["pab", `pab--${variant}`, direction === "down" && "pab--down", className].filter(Boolean).join(" ")}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : null)}
    >
      <span className="pab-panel" aria-hidden="true">
        <span className="pab-single"><PixelChevron /></span>
      </span>
      <span className="pab-row" aria-hidden="true">
        {Array.from({ length: ROW_LENGTH }, (_, i) => <PixelChevron key={i} index={i} />)}
      </span>
      <span className="pab-label">{children}</span>
    </a>
  );
}
