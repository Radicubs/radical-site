"use client";

import { useRef, type CSSProperties, type MouseEvent, type MouseEventHandler, type PointerEvent, type ReactNode } from "react";
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
// On touch screens the tap plays the sweep first, then follows the link.
const SWEEP_MS = 420;
// How far the panel has to be dragged before letting go opens the link.
const DRAG_COMMIT = 0.55;

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
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Split button: a pixel-arrow panel that sweeps across the label on hover and runs a wave of arrows.
 * On touch screens there is no hover, so a tap plays the sweep before opening the link, and the
 * panel can also be dragged across like a slider.
 */
export function PixelArrowButton({ href, children, variant = "primary", direction = "right", external, className, onClick }: PixelArrowButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const touch = useRef(false);
  const drag = useRef<{ x: number; y: number; track: number; progress: number; active: boolean } | null>(null);
  const skipClick = useRef(false);
  const bypass = useRef(false);

  const setOn = (on: boolean) => ref.current?.classList.toggle("is-on", on);
  const setDrag = (progress: number | null) => {
    const el = ref.current;
    if (!el) return;
    el.classList.toggle("is-dragging", progress !== null);
    if (progress === null) el.style.removeProperty("--pab-drag");
    else el.style.setProperty("--pab-drag", String(progress));
  };

  // Sweep the panel across, then click for real (keeps target="_blank" and any onClick).
  const sweepThenOpen = () => {
    setOn(true);
    window.setTimeout(() => {
      bypass.current = true;
      ref.current?.click();
      bypass.current = false;
      window.setTimeout(() => setOn(false), 600);
    }, SWEEP_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    touch.current = event.pointerType !== "mouse";
    skipClick.current = false;
    if (!touch.current) return;
    // Distance the panel's right edge can travel, measured before it starts to grow.
    const panel = event.currentTarget.querySelector<HTMLElement>(".pab-panel");
    const track = Math.max(1, event.currentTarget.clientWidth - (panel?.offsetWidth ?? 0));
    drag.current = { x: event.clientX, y: event.clientY, track, progress: 0, active: false };
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const state = drag.current;
    const el = ref.current;
    if (!state || !el) return;
    const dx = event.clientX - state.x;
    if (!state.active) {
      if (Math.abs(dx) < 8) return;
      // Mostly vertical: the visitor is scrolling the page, not sliding the button.
      if (Math.abs(event.clientY - state.y) > Math.abs(dx)) { drag.current = null; return; }
      state.active = true;
      el.setPointerCapture(event.pointerId);
    }
    state.progress = Math.min(1, Math.max(0, dx / state.track));
    setDrag(state.progress);
  };

  const handlePointerUp = () => {
    const state = drag.current;
    drag.current = null;
    if (!state?.active) return;
    skipClick.current = true;
    setDrag(null);
    if (state.progress >= DRAG_COMMIT) sweepThenOpen();
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (bypass.current) return onClick?.(event);
    if (skipClick.current) {
      skipClick.current = false;
      event.preventDefault();
      return;
    }
    const plain = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
    if (touch.current && plain) {
      // Hold the link (and Lenis's anchor handling) until the sweep has played.
      event.preventDefault();
      event.nativeEvent.stopPropagation();
      sweepThenOpen();
      return;
    }
    onClick?.(event);
  };

  return (
    <a
      ref={ref}
      className={["pab", `pab--${variant}`, direction === "down" && "pab--down", className].filter(Boolean).join(" ")}
      href={href}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { drag.current = null; setDrag(null); }}
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
