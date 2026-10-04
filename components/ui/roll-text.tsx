import type { CSSProperties } from "react";
import "./roll-text.css";

/** Letters roll up one after another on hover, swapping in an accent-coloured copy. */
export function RollText({ text }: { text: string }) {
  return (
    <span className="roll-text" aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span key={i} className="roll-text-char" style={{ "--i": i } as CSSProperties} aria-hidden="true">
          <span>{char === " " ? " " : char}</span>
          <span>{char === " " ? " " : char}</span>
        </span>
      ))}
    </span>
  );
}
