"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef
} from "react";
import {
  elasticScrollBoundaryRef,
  type ElasticBoundaryEdge,
  type ElasticScrollBoundary
} from "@/components/ui/lenis-singleton";
import "./CardSwap.css";

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  /** Drive swaps from scroll progress over a pinned region instead of a timer. */
  scrollDriven?: boolean;
  /** Element pinned while the deck advances. Required when scrollDriven. */
  pinRef?: RefObject<HTMLElement | null>;
  /** Viewport heights of scroll distance allotted to each card. */
  stepHeight?: number;
  onActiveChange?: (idx: number) => void;
  className?: string;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ""} ${rest.className ?? ""}`.trim()} />
));
Card.displayName = "Card";

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  scrollDriven = false,
  pinRef,
  stepHeight = 0.8,
  onActiveChange,
  className,
  children
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);
  const activeCbRef = useRef(onActiveChange);
  activeCbRef.current = onActiveChange;

  useEffect(() => {
    const total = refs.length;
    if (!total) return;

    // Place by the *current* order, not by raw index. order is a ref that
    // survives effect re-runs, so placing by index would strand the deck
    // showing one card while the logic believed another was in front.
    const placeForFront = (frontIdx: number, announce = true) => {
      const next = Array.from({ length: total }, (_, k) => (frontIdx + k) % total);
      order.current = next;
      next.forEach((cardIdx, slotIdx) =>
        placeNow(refs[cardIdx].current!, makeSlot(slotIdx, cardDistance, verticalDistance, total), skewAmount)
      );
      if (announce) activeCbRef.current?.(frontIdx);
    };

    const setHierarchy = (indices: number[]) => {
      indices.forEach((cardIdx, slotIdx) => {
        gsap.set(refs[cardIdx].current!, { zIndex: total - slotIdx });
      });
    };

    placeForFront(order.current[0] ?? 0, false);

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current!;
      // One timeline at a time: overlapping tweens on the same cards is what
      // makes fast scrolling look choppy.
      tlRef.current?.kill();
      setHierarchy(order.current);
      const tl = gsap.timeline();
      tlRef.current = tl;

      // Commit the new order and announce the incoming card immediately. The
      // promotion happens early in the timeline, so deferring either to the end
      // leaves captions a card behind and lets fast scrolling swap a stale front.
      order.current = [...rest, front];
      activeCbRef.current?.(rest[0]);

      const frontSlotY = makeSlot(0, cardDistance, verticalDistance, refs.length).y;
      tl.to(elFront, {
        y: frontSlotY + 500,
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current!;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return"
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        "return"
      );

    };

    // True inverse of swap(): keep the incoming rear card beneath the stack
    // until it has moved fully clear, flip the complete hierarchy off-stage,
    // then bring it up over the demoting cards. Switching z-index while the
    // card is still inside the stack makes the planes appear to pass through
    // one another, especially when the scroll direction changes quickly.
    const swapBack = () => {
      if (order.current.length < 2) return;

      const previousOrder = [...order.current];
      const back = previousOrder[previousOrder.length - 1];
      const head = previousOrder.slice(0, -1);
      const nextOrder = [back, ...head];
      const elBack = refs[back].current!;
      tlRef.current?.kill();
      setHierarchy(previousOrder);
      const tl = gsap.timeline();
      tlRef.current = tl;

      order.current = nextOrder;
      activeCbRef.current?.(back);

      // The literal structural mirror of swap(): same two legs on the moving
      // card, same overlap/label timing, same per-card stagger — just the
      // back card in place of the front card, and everyone else demoting
      // instead of promoting. Using swap()'s own proven timing here (instead
      // of inventing new numbers) is what keeps this from either dragging
      // (stagger/labels pushed too late) or cutting through the stack
      // (moving too fast to read as the same motion in reverse).
      const frontSlotY = makeSlot(0, cardDistance, verticalDistance, refs.length).y;
      tl.to(elBack, {
        y: frontSlotY + 500,
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel("demote", `-=${config.durDrop * config.promoteOverlap}`);
      head.forEach((idx, i) => {
        const el = refs[idx].current!;
        const slot = makeSlot(i + 1, cardDistance, verticalDistance, refs.length);
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `demote+=${i * 0.15}`
        );
      });

      tl.addLabel("rise", `demote+=${config.durMove * config.returnDelay}`);
      tl.call(() => setHierarchy(nextOrder), undefined, "rise");

      const frontSlot = makeSlot(0, cardDistance, verticalDistance, refs.length);
      tl.to(
        elBack,
        {
          x: frontSlot.x,
          y: frontSlot.y,
          z: frontSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        "rise"
      );
    };

    if (scrollDriven) {
      const pinEl = pinRef?.current;
      if (!pinEl) return;

      gsap.registerPlugin(ScrollTrigger);

      // N cards means N-1 transitions. Allotting scroll per transition (not per
      // card) means progress 0 sits exactly on card 1 and progress 1 exactly on
      // card N, so the pin releases the moment either end is reached instead of
      // holding with nothing left to swap.
      const steps = Math.max(1, total - 1);
      // A card owns the full interval before the next boundary. Using round()
      // flipped halfway through that interval, at the exact point where the
      // deck's resistance was strongest, and left half an interval of dead
      // pinned scroll after the final card appeared. Advancing at the interval
      // boundary keeps each card readable for a complete interval and makes
      // the final swap coincide with the lower scroll boundary.
      // The epsilon absorbs sub-pixel rounding when something (e.g. the
      // magnet's scrollTo) lands a hair short of an exact step boundary —
      // 0.00001 only tolerated ~0.0000025 of progress, far less than a
      // pixel's worth on a several-hundred-pixel-per-step deck, so landing
      // even slightly short of the last card read as one step behind it.
      const stepFor = (progress: number) =>
        Math.max(0, Math.min(steps, Math.floor(progress * steps + 0.01)));
      let step = 0;

      // Snap the deck to whatever the scroll position already implies, so
      // re-entering the section (or a refresh mid-section) shows the card that
      // belongs there instead of resetting to the first one.
      const syncToScroll = (progress: number) => {
        step = stepFor(progress);
        placeForFront(step);
      };

      const boundary: ElasticScrollBoundary = {
        id: Symbol("card-swap-boundary"),
        start: 0,
        end: 0,
        pinStart: 0,
        pinEnd: 0,
        holdingEdge: null,
        releaseReady: true,
        holdingStep: false,
        holdPosition: 0,
        onImpact: (edge: ElasticBoundaryEdge) => {
          boundary.releaseReady = false;
          const destination = edge === "end" ? steps : 0;

          if (step !== destination) {
            tlRef.current?.kill();
            // A very fast gesture can skip multiple cards. Snap only the
            // skipped states, then play the edge transition itself in full.
            if (edge === "end") {
              if (step < steps - 1) {
                placeForFront(steps - 1, false);
                step = steps - 1;
              }
              swap();
            } else {
              if (step > 1) {
                placeForFront(1, false);
                step = 1;
              }
              swapBack();
            }
            step = destination;
          }

          const finalTransition = tlRef.current;
          // isActive() is false during the tiny gap between creating a GSAP
          // timeline and its first rendered frame. Progress is authoritative:
          // zero means the transition has started and must still hold scroll.
          if (!finalTransition || finalTransition.progress() >= 1) {
            boundary.releaseReady = true;
            return;
          }

          // Scroll release is tied to the actual GSAP timeline, not a timeout,
          // so changing the card timing cannot accidentally shorten the gate.
          finalTransition.eventCallback("onComplete", () => {
            if (elasticScrollBoundaryRef.current?.id === boundary.id && step === destination) {
              boundary.releaseReady = true;
            }
          });
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: pinEl,
        start: "top top",
        // Resolve the documented viewport-height unit explicitly. Percentage
        // end values are relative to ScrollTrigger's measured trigger box and
        // changed after refreshes, making card travel inconsistent.
        end: () => `+=${Math.round(steps * stepHeight * window.innerHeight)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: self => {
          // On the upward trip, the matching edge is the 02 -> 01 boundary,
          // not the top of the pin. Card 01 still gets its full interval after
          // the gated transition finishes.
          boundary.start = self.start + (self.end - self.start) / steps;
          boundary.end = self.end;
          boundary.pinStart = self.start;
          boundary.pinEnd = self.end;
          elasticScrollBoundaryRef.current = boundary;
          if (boundary.holdingEdge) {
            step = boundary.holdingEdge === "end" ? steps : 0;
            placeForFront(step);
          } else {
            syncToScroll(self.progress);
          }
        },
        onLeave: () => {
          // ScrollTrigger also fires onLeave when the recoil first touches the
          // exact end. Keep the final card held until its timeline is complete;
          // the later, released crossing is the one that may clear the hold.
          if (boundary.releaseReady && boundary.holdingEdge === "end") boundary.holdingEdge = null;
        },
        onLeaveBack: () => {
          if (boundary.releaseReady && boundary.holdingEdge === "start") boundary.holdingEdge = null;
        },
        onUpdate: self => {
          // A hold is already in flight — SmoothScroll is clamping scroll to
          // holdPosition and swallowing wheel input for us, so ScrollTrigger's
          // progress readout here is stale until that transition completes.
          if (boundary.holdingStep) return;
          const next = stepFor(self.progress);
          if (boundary.holdingEdge === "end" && step === steps && next < steps) return;
          if (boundary.holdingEdge === "start" && step === 0 && next > 0) return;
          if (next === step) return;
          const dir = next > step ? 1 : -1;
          // Only one card advances per gesture, in either direction — hold
          // scroll at this step's threshold until its transition finishes,
          // regardless of how far the triggering scroll actually reached.
          const target = step + dir;
          // The transition into the very first/last card is owned by the
          // wheel-level elastic-boundary system, whose boundary.start/end
          // sit one card-interval inset from self.start/self.end (they mark
          // the 01<->02 and 04<->05 thresholds, not this deck's own progress
          // boundary) — anchor the hold there instead of this deck's own
          // step math, and route the actual transition through the same
          // onImpact it already uses: it's idempotent (checks
          // step !== destination first), so it's safe even if the wheel
          // handler's own discrete-event catch also reaches this edge.
          // Needed as a frame-driven fallback in the first place because
          // that catch only fires on a wheel event landing at just the
          // right moment — a gesture that ends while Lenis is still
          // coasting toward/past the edge would otherwise never get caught,
          // and without clamping scroll to the edge first (as the wheel
          // path does), the pin can unpin under leftover momentum and the
          // page scrolls straight past while the card animates unseen.
          const isEdgeTransition = target === 0 || target === steps;
          const edge: ElasticBoundaryEdge | null = target === steps ? "end" : target === 0 ? "start" : null;
          // Holding exactly at the crossed boundary (step/steps) is only
          // correct going forward: stepFor's floor convention maps that
          // exact value to the range starting there, i.e. the step you're
          // advancing INTO. Reversing crosses the same boundary from the
          // other side, so holding there reads back as the card you just
          // left — nudge just inside target's own range (past stepFor's
          // own 0.01 tolerance) so it reliably reads as target instead.
          const crossingProgress = Math.max(step, target) / steps;
          const holdProgress = dir > 0 ? crossingProgress : crossingProgress - 0.02 / steps;
          boundary.holdPosition = isEdgeTransition && edge
            ? (edge === "end" ? boundary.end : boundary.start)
            : self.start + holdProgress * (self.end - self.start);
          boundary.holdingStep = true;
          if (isEdgeTransition && edge) {
            boundary.holdingEdge = edge;
            // onImpact reads step to decide whether it still has a
            // transition to play (step !== destination) and sets it to
            // destination itself — setting it here first would make that
            // check a no-op and silently skip the animation.
            boundary.onImpact(edge);
            step = target;
          } else {
            // Landing on a middle card retires any edge hold — onLeave/
            // onLeaveBack and the wheel handler's reversal-cancel are the
            // only other places this ever gets cleared, and neither fires
            // just from moving off the edge card internally (without
            // actually exiting the pin). Left stale, a later return trip to
            // this same edge would misread onUpdate's own protective
            // holdingEdge guards (meant to stop the bounce's inward recoil
            // from being misread as a user-initiated reversal) as still
            // applying, even though the bounce that set them ended long ago.
            boundary.holdingEdge = null;
            if (dir > 0) swap();
            else swapBack();
            step = target;
          }

          const release = () => {
            boundary.holdingStep = false;
          };
          const activeTransition = tlRef.current;
          if (!activeTransition || activeTransition.progress() >= 1) {
            release();
          } else if (isEdgeTransition) {
            // onImpact already attached its own onComplete (to flip
            // releaseReady once this transition finishes) — chain ours
            // after it instead of overwriting, or releaseReady would never
            // flip and a later leave/re-entry could misread holdingEdge.
            const existing = activeTransition.eventCallback("onComplete");
            activeTransition.eventCallback("onComplete", () => {
              existing?.();
              release();
            });
          } else {
            activeTransition.eventCallback("onComplete", release);
          }
        }
      });

      boundary.start = trigger.start + (trigger.end - trigger.start) / steps;
      boundary.end = trigger.end;
      boundary.pinStart = trigger.start;
      boundary.pinEnd = trigger.end;
      elasticScrollBoundaryRef.current = boundary;
      syncToScroll(trigger.progress);

      // GSAP auto-refreshes on window "load", but content above this section
      // (hero images, etc.) can still be reflowing after that snapshot — or
      // "load" may have already fired before this mounted (client hydration
      // timing) — leaving pinStart/pinEnd stale until something else forces
      // a recalculation. Force one more refresh once things have had a beat
      // to settle, covering both cases. Guarded to skip while the pin is
      // actively engaged: refreshing mid-interaction can shift self.progress
      // by a hair, and onRefresh's syncToScroll would then silently re-place
      // the deck — reading as an unrequested card change or corrupting which
      // step an in-flight hold thinks it's targeting.
      const refresh = () => {
        if (!trigger.isActive) ScrollTrigger.refresh();
      };
      const refreshTimer = window.setTimeout(refresh, 600);
      window.addEventListener("load", refresh);

      return () => {
        if (elasticScrollBoundaryRef.current?.id === boundary.id) elasticScrollBoundaryRef.current = null;
        window.clearTimeout(refreshTimer);
        window.removeEventListener("load", refresh);
        trigger.kill();
        tlRef.current?.kill();
      };
    }

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current!;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener("mouseenter", pause);
      node.addEventListener("mouseleave", resume);
      return () => {
        node.removeEventListener("mouseenter", pause);
        node.removeEventListener("mouseleave", resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, scrollDriven, stepHeight, pinRef, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div ref={container} className={`card-swap-container${className ? ` ${className}` : ""}`} style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
