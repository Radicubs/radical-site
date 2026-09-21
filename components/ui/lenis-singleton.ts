import type Lenis from "lenis";

// Shared handle to the single Lenis instance SmoothScroll mounts, so other
// components (e.g. a pinned scroll section that wants to rubber-band the
// actual scroll position, not just its own visuals) can drive it without
// each creating their own instance.
export const lenisRef: { current: Lenis | null } = { current: null };
