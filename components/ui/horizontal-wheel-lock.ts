import { lenisRef } from "@/components/ui/lenis-singleton";

// Trackpad swipes carry both deltaX and deltaY, so over a horizontal carousel the page
// would scroll vertically at the same time. Lock each gesture to one axis:
// - a sideways gesture over a horizontal scroller moves only that scroller;
// - a sideways gesture over a pinned scroll-driven section drives its progress,
//   since that section advances with vertical scroll.

const GESTURE_IDLE_MS = 160;
const LINE_HEIGHT = 16;
const PINNED_ACT = '[data-sc-act="pan"], [data-sc-act="scrub"]';

function horizontalScroller(target: EventTarget | null): HTMLElement | null {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body) {
    if (el instanceof HTMLElement && el.scrollWidth > el.clientWidth + 1) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return el;
    }
    el = el.parentElement;
  }
  return null;
}

/** A scroll-driven section currently pinned to the viewport, and its horizontal gesture scale. */
function pinnedAct(target: EventTarget | null): { scrollPerPx: number } | null {
  const act = target instanceof Element ? target.closest<HTMLElement>(PINNED_ACT) : null;
  if (!act) return null;
  const rect = act.getBoundingClientRect();
  if (rect.top > 1 || rect.bottom < window.innerHeight - 1) return null;
  const track = act.querySelector<HTMLElement>(".film-story-rail, [data-pan-track]");
  const travel = track ? track.scrollWidth - act.clientWidth : 0;
  const span = act.offsetHeight - window.innerHeight;
  return { scrollPerPx: travel > 0 && span > 0 ? span / travel : 1 };
}

export function installHorizontalWheelLock() {
  let axis: "x" | "y" | null = null;
  let scroller: HTMLElement | null = null;
  let pan: { scrollPerPx: number } | null = null;
  let idle = 0;

  const endGesture = () => {
    // Restoring snap lets the carousel settle on the nearest item.
    if (scroller) scroller.style.scrollSnapType = "";
    axis = null;
    scroller = null;
    pan = null;
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return; // pinch-zoom
    const scale = event.deltaMode === 1 ? LINE_HEIGHT : event.deltaMode === 2 ? window.innerHeight : 1;
    // Shift + mouse wheel is a horizontal scroll on most platforms.
    const dx = (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) * scale;
    const dy = (event.shiftKey && !event.deltaX ? 0 : event.deltaY) * scale;

    if (axis === null) {
      const sideways = Math.abs(dx) > Math.abs(dy);
      scroller = sideways ? horizontalScroller(event.target) : null;
      pan = sideways && !scroller ? pinnedAct(event.target) : null;
      axis = sideways && (scroller || pan) ? "x" : "y";
    }
    window.clearTimeout(idle);
    idle = window.setTimeout(endGesture, GESTURE_IDLE_MS);

    if (axis !== "x") return;
    // Keep the page (and Lenis) from also applying the vertical drift.
    event.preventDefault();
    event.stopPropagation();

    if (scroller) {
      scroller.style.scrollSnapType = "none";
      scroller.scrollBy({ left: dx, behavior: "instant" });
      return;
    }
    if (pan) {
      // Sideways swipe drives the pinned pan by converting it to page scroll.
      const by = dx * pan.scrollPerPx;
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(lenis.targetScroll + by);
      else window.scrollBy({ top: by, behavior: "instant" });
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  return () => {
    window.clearTimeout(idle);
    endGesture();
    window.removeEventListener("wheel", onWheel, { capture: true });
  };
}
