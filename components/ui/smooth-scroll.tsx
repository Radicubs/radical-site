"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import {
  elasticScrollBoundaryRef,
  lenisRef,
  type ElasticBoundaryEdge
} from "@/components/ui/lenis-singleton";

// lerp 0.1 is Lenis' documented default (~1.2s settle) — weighted but not
// sluggish. Raise toward 0.2 for snappier, drop toward 0.06 for heavier.
const LERP = 0.1;
const VELOCITY_WINDOW_MS = 120;
// Gap needed before a wheel event counts as a distinct new gesture, rather
// than the momentum tail of whatever just triggered the bounce — was 220ms,
// which reads as "stuck" if the user is scrolling continuously without a
// natural pause. Short enough to still filter true momentum tails, long
// enough that a normal continuous scroll's own micro-gaps register quickly.
const NEW_GESTURE_GAP_MS = 90;
const MIN_RECOIL = 36;
const MAX_RECOIL = 140;
const REARM_DISTANCE = MAX_RECOIL + 24;
const MIN_IMPACT_SPEED = 180;
const MAX_IMPACT_SPEED = 1800;
const RECOIL_DAMPING = 8.5;
const RECOIL_STOP_SPEED = 10;
const MAGNET_CAPTURE_FRACTION = 0.35;
const MAGNET_DURATION = 1.3;
type BoundaryPhase = "idle" | "magnetizing" | "impact" | "recoil" | "latched";

interface WheelSample {
  time: number;
  delta: number;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    let lenis: Lenis | null = null;
    let boundaryId: symbol | null = null;
    let boundaryPhase: BoundaryPhase = "idle";
    let activeEdge: ElasticBoundaryEdge | null = null;
    let releasedEdge: ElasticBoundaryEdge | null = null;
    let lastWheelAt = 0;
    let lastWheelDirection = 0;
    let wheelSamples: WheelSample[] = [];
    let recoilDistance = 0;
    let recoilElapsed = 0;
    let recoilLastFrame = 0;

    const resetBoundaryMotion = () => {
      boundaryPhase = "idle";
      activeEdge = null;
      releasedEdge = null;
      lastWheelAt = 0;
      lastWheelDirection = 0;
      wheelSamples = [];
      recoilDistance = 0;
      recoilElapsed = 0;
      recoilLastFrame = 0;
    };

    const recordInput = (time: number, delta: number, startsNewGesture: boolean) => {
      if (startsNewGesture) wheelSamples = [];
      wheelSamples.push({ time, delta: Math.abs(delta) });
      wheelSamples = wheelSamples.filter(sample => time - sample.time <= VELOCITY_WINDOW_MS);
    };

    const getImpactSpeed = () => {
      if (!wheelSamples.length) return MIN_IMPACT_SPEED;
      const totalDelta = wheelSamples.reduce((sum, sample) => sum + sample.delta, 0);
      // A single mouse-wheel notch has no measurable span. Giving it an 80ms
      // interval keeps it proportional without treating it like an infinite
      // velocity spike; dense trackpad samples use their real elapsed time.
      const sampleSpan =
        wheelSamples.length === 1
          ? 80
          : Math.max(16, wheelSamples[wheelSamples.length - 1].time - wheelSamples[0].time);
      return (totalDelta / sampleSpan) * 1000;
    };

    lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      syncTouch: false,
      virtualScroll: data => {
        const boundary = elasticScrollBoundaryRef.current;
        if (!boundary || !(data.event instanceof WheelEvent)) return true;

        if (boundary.id !== boundaryId) {
          boundaryId = boundary.id;
          resetBoundaryMotion();
        }

        // A single card transition is playing — swallow scroll entirely
        // until it completes (the raf ticker below is what actually holds
        // the position). No gesture/velocity bookkeeping while held, so the
        // next real gesture after release starts clean.
        if (boundary.holdingStep) {
          if (data.event.cancelable) data.event.preventDefault();
          return false;
        }

        const now = performance.now();
        const wheelDirection = Math.sign(data.deltaY);
        const startsNewGesture =
          lastWheelAt === 0 ||
          now - lastWheelAt > NEW_GESTURE_GAP_MS ||
          (lastWheelDirection !== 0 && wheelDirection !== lastWheelDirection);
        lastWheelAt = now;
        lastWheelDirection = wheelDirection;
        const scrollTarget = lenis?.targetScroll ?? window.scrollY;
        const edge: ElasticBoundaryEdge | null =
          data.deltaY > 0 ? "end" : data.deltaY < 0 ? "start" : null;
        if (!edge) return true;

        if (activeEdge && activeEdge !== edge && boundaryPhase !== "idle") {
          // Reversing back into the card section cancels the current edge
          // latch immediately. The opposite boundary can arm independently.
          boundaryPhase = "idle";
          activeEdge = null;
          releasedEdge = null;
          wheelSamples = [];
          boundary.holdingEdge = null;
          boundary.releaseReady = true;
        }

        recordInput(now, data.deltaY, startsNewGesture);

        if (releasedEdge === edge) {
          const rearmed =
            edge === "end"
              ? scrollTarget < boundary.end - REARM_DISTANCE
              : scrollTarget > boundary.start + REARM_DISTANCE;
          if (rearmed) releasedEdge = null;
          else return true;
        }

        if (edge === "end" && scrollTarget > boundary.end + 1) return true;
        if (edge === "start" && scrollTarget < boundary.start - 1) return true;

        if (boundaryPhase !== "idle") {
          if (activeEdge === edge && boundaryPhase === "latched") {
            if (!boundary.releaseReady) {
              if (data.event.cancelable) data.event.preventDefault();
              return false;
            }
            // releaseReady (flipped once the bounce itself settles, not
            // gated on a distinct gesture) is what actually says the
            // momentum has been absorbed now — requiring startsNewGesture
            // on top of that meant someone scrolling continuously, with no
            // natural pause, stayed stuck here indefinitely even after the
            // bounce had long since finished.
            boundaryPhase = "idle";
            activeEdge = null;
            releasedEdge = edge;
            return true;
          }

          // Consume the rest of the impact gesture before Lenis sees it. Doing
          // this at the raw event layer prevents a second scroll target from
          // fighting the approach/recoil sequence.
          if (data.event.cancelable) data.event.preventDefault();
          return false;
        }

        // Approaching the pinned section from entirely outside it (not yet
        // even on card 1/the last card) once any part of it would be on
        // screen — pull the rest of the way in ourselves instead of letting
        // the user's own scrolling carry them through at an arbitrary pace.
        // Must intercept here, at the raw wheel layer: a passive listener
        // that merely calls scrollTo afterward gets overridden by the very
        // next wheel tick of the same gesture, since Lenis's normal
        // smoothWheel handling keeps re-targeting off the user's input.
        const approachingFromAbove = edge === "end" && scrollTarget < boundary.pinStart - 1;
        const approachingFromBelow = edge === "start" && scrollTarget > boundary.pinEnd + 1;
        if (lenis && (approachingFromAbove || approachingFromBelow)) {
          const entryPoint = approachingFromAbove ? boundary.pinStart : boundary.pinEnd;
          const distanceToEntry = Math.abs(entryPoint - scrollTarget);
          // A third of a screen, not a whole one — the section should be
          // clearly on screen before this takes over, not just a sliver
          // peeking in from a full viewport away.
          if (distanceToEntry <= window.innerHeight * MAGNET_CAPTURE_FRACTION) {
            boundaryPhase = "magnetizing";
            activeEdge = edge;
            if (data.event.cancelable) data.event.preventDefault();
            lenis.scrollTo(entryPoint, {
              duration: MAGNET_DURATION,
              // Ease in-out: previously an ease-out alone, which jumped to
              // full speed instantly at the start. Tapering both ends reads
              // as a gentle pull rather than a yank.
              easing: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
              force: true,
              onComplete: () => {
                // Snap the exact pixel rather than trusting the tween's last
                // frame — landing a hair short of entryPoint is enough for
                // CardSwap's stepFor to misread which card that is.
                lenis?.scrollTo(entryPoint, { immediate: true, force: true });
                if (boundaryPhase === "magnetizing") {
                  boundaryPhase = "idle";
                  activeEdge = null;
                }
              }
            });
            return false;
          }
        }

        const distanceToBoundary =
          edge === "end" ? boundary.end - scrollTarget : scrollTarget - boundary.start;
        if (Math.abs(data.deltaY) < distanceToBoundary) return true;

        const impactSpeed = getImpactSpeed();
        const speedProgress = gsap.utils.clamp(
          0,
          1,
          (impactSpeed - MIN_IMPACT_SPEED) / (MAX_IMPACT_SPEED - MIN_IMPACT_SPEED)
        );
        recoilDistance = MIN_RECOIL + (MAX_RECOIL - MIN_RECOIL) * speedProgress;
        recoilElapsed = 0;
        recoilLastFrame = 0;

        // Let Lenis finish the visible approach to the active edge, but cap its
        // target exactly there. The ticker then owns the inward inertial coast.
        data.deltaY =
          edge === "end"
            ? Math.max(0.001, boundary.end - scrollTarget)
            : Math.min(-0.001, boundary.start - scrollTarget);
        boundaryPhase = "impact";
        activeEdge = edge;
        boundary.holdingEdge = edge;
        // Close the release gate before Lenis reaches the end. ScrollTrigger's
        // onLeave fires during that final Lenis frame, before the ticker gets
        // a chance to start the card timeline.
        boundary.releaseReady = false;
        return true;
      }
    });
    lenisRef.current = lenis;

    // Drive Lenis from GSAP's ticker and push every frame into ScrollTrigger,
    // otherwise the pinned card deck reads stale scroll positions.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => {
      const timeMs = time * 1000;
      lenis?.raf(timeMs);
      const boundary = elasticScrollBoundaryRef.current;
      if (!lenis || !boundary || boundary.id !== boundaryId) return;

      if (boundary.holdingStep) {
        lenis.scrollTo(boundary.holdPosition, { immediate: true, force: true });
        return;
      }

      const edge = activeEdge;
      if (!edge) return;
      const edgePosition = edge === "end" ? boundary.end : boundary.start;
      const reachedEdge =
        edge === "end"
          ? lenis.animatedScroll >= edgePosition - 1.5
          : lenis.animatedScroll <= edgePosition + 1.5;

      if (boundaryPhase === "impact" && reachedEdge) {
        // Clamp the final sub-pixel of the approach so every recoil starts at
        // the same physical edge, then start the final card transition at the
        // actual visible impact rather than while Lenis is still approaching.
        lenis.scrollTo(edgePosition, { immediate: true, force: true });
        boundary.onImpact(edge);
        boundaryPhase = "recoil";
        recoilLastFrame = timeMs;
        return;
      }

      if (boundaryPhase === "recoil") {
        const deltaSeconds = Math.min(1 / 30, Math.max(0, (timeMs - recoilLastFrame) / 1000));
        recoilLastFrame = timeMs;
        recoilElapsed += deltaSeconds;

        // Exponential velocity decay is the same shape as inertial scrolling.
        // Both edges recoil inward: upward from the bottom, downward from top.
        const decay = Math.exp(-RECOIL_DAMPING * recoilElapsed);
        const recoilDirection = edge === "end" ? -1 : 1;
        const position = edgePosition + recoilDirection * recoilDistance * (1 - decay);
        const speed = recoilDistance * RECOIL_DAMPING * decay;
        lenis.scrollTo(position, { immediate: true, force: true });

        if (speed <= RECOIL_STOP_SPEED) {
          boundaryPhase = "latched";
          recoilLastFrame = 0;
          // Leaving the section only needs the bounce itself to have
          // settled, not the card-flip timeline CardSwap kicked off on
          // impact (that one still gates re-entry within the deck via its
          // own onComplete/releaseReady, independently — this just stops
          // it from ALSO blocking the exit for its full ~1.7s once the
          // visible bounce is already done).
          boundary.releaseReady = true;
        }
      }
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
