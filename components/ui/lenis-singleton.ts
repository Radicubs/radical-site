import type Lenis from "lenis";

// Shared handle to the single Lenis instance SmoothScroll mounts.
export const lenisRef: { current: Lenis | null } = { current: null };

export type ElasticBoundaryEdge = "start" | "end";

export interface ElasticScrollBoundary {
  id: symbol;
  start: number;
  end: number;
  // The pin's raw engage/release scroll positions (trigger.start/trigger.end),
  // distinct from start/end above (which are inset by one card-interval and
  // only describe the in-deck edge-bounce). Used to detect approach from
  // outside the pinned section entirely, from either direction.
  pinStart: number;
  pinEnd: number;
  holdingEdge: ElasticBoundaryEdge | null;
  releaseReady: boolean;
  // True while a single card transition is animating. SmoothScroll swallows
  // all wheel input and clamps scroll to holdPosition for the duration, so
  // only one card advances per gesture, in either direction, and scroll
  // can't drift ahead of what's actually been shown.
  holdingStep: boolean;
  holdPosition: number;
  onImpact: (edge: ElasticBoundaryEdge) => void;
}

// CardSwap only describes where its invisible edge is. SmoothScroll remains
// the sole owner of wheel input, so the two systems never fight over scroll.
export const elasticScrollBoundaryRef: { current: ElasticScrollBoundary | null } = { current: null };
