import type Lenis from "lenis";

// Shared handle to the single Lenis instance SmoothScroll mounts.
export const lenisRef: { current: Lenis | null } = { current: null };

// A single card transition is playing — SmoothScroll swallows wheel input
// and clamps scroll to holdPosition for the duration, so only one card
// advances per gesture and scroll can't drift ahead of what's been shown.
export interface ScrollLock {
  id: symbol;
  holding: boolean;
  holdPosition: number;
}

export const scrollLockRef: { current: ScrollLock | null } = { current: null };
