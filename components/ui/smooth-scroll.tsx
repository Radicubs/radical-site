"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { lenisRef, scrollLockRef } from "@/components/ui/lenis-singleton";

// lerp 0.1 is Lenis' documented default (~1.2s settle) — weighted but not
// sluggish. Raise toward 0.2 for snappier, drop toward 0.06 for heavier.
const LERP = 0.1;

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      syncTouch: false,
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
