"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { lenisRef, scrollLockRef } from "@/components/ui/lenis-singleton";
import { installHorizontalWheelLock } from "@/components/ui/horizontal-wheel-lock";

// A quicker settle keeps sections fluid without making the page feel delayed.
const LERP = 0.18;

export function SmoothScroll() {
  // Needed with or without Lenis: native scrolling has the same diagonal-swipe problem.
  useEffect(() => installHorizontalWheelLock(), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      syncTouch: false,
      // Glide to in-page #anchors instead of jumping; section scroll-margin-top clears the sticky navbar.
      anchors: { duration: 1.4, easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
      virtualScroll: data => {
        // A card transition is playing — swallow scroll entirely until it
        // completes. The raf loop below is what actually holds the position.
        const lock = scrollLockRef.current;
        if (lock?.holding && data.event instanceof WheelEvent) {
          if (data.event.cancelable) data.event.preventDefault();
          return false;
        }
        return true;
      }
    });
    lenisRef.current = lenis;

    // Drive Lenis from GSAP's ticker and push every frame into ScrollTrigger,
    // otherwise the pinned card deck reads stale scroll positions.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => {
      lenis.raf(time * 1000);
      const lock = scrollLockRef.current;
      if (lock?.holding) lenis.scrollTo(lock.holdPosition, { immediate: true, force: true });
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
