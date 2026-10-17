"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { lenisRef, scrollRestoreRef } from "./lenis-singleton";

declare global {
  interface Window {
    __radicubsReloadScroll?: { url: string; y: number; previous: ScrollRestoration; started?: boolean };
  }
}

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.__radicubsReloadScroll;
    if (!saved) return;
    if (saved.url !== location.href) {
      delete window.__radicubsReloadScroll;
      return;
    }

    history.scrollRestoration = "manual";
    scrollRestoreRef.current = true;
    let frame = 0;
    let finished = false;
    let previousHeight = 0;
    let stableSince = performance.now();
    const position = (top: number) => {
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, left: 0, behavior: "instant" });
    };
    const finish = () => {
      finished = true;
      cancelAnimationFrame(frame);
      scrollRestoreRef.current = false;
      history.scrollRestoration = saved.previous;
      delete window.__radicubsReloadScroll;
    };
    const cancel = (event: Event) => {
      if (event instanceof KeyboardEvent && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
      finish();
    };

    const waitForLayout = (now: number) => {
      if (finished) return;
      position(0);
      const height = document.documentElement.scrollHeight;
      if (height !== previousHeight) {
        previousHeight = height;
        stableSince = now;
      }
      const loaderVisible = !document.documentElement.hasAttribute("data-skip-loader") && document.querySelector(".site-loader");
      // Streaming sections, fonts, and pinned layouts must settle before measuring.
      if (document.readyState !== "complete" || document.fonts.status !== "loaded" || loaderVisible || now - stableSince < 200) {
        frame = requestAnimationFrame(waitForLayout);
        return;
      }

      const target = Math.min(saved.y, Math.max(0, height - innerHeight));
      saved.started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        position(target);
        finish();
        return;
      }
      const duration = Math.min(1800, Math.max(900, target * 0.15));
      const started = now;
      const animate = (time: number) => {
        if (finished) return;
        const progress = Math.min(1, (time - started) / duration);
        position(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) frame = requestAnimationFrame(animate);
        else finish();
      };
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("keydown", cancel);
    frame = requestAnimationFrame(waitForLayout);
    return () => {
      cancelAnimationFrame(frame);
      scrollRestoreRef.current = false;
      history.scrollRestoration = saved.previous;
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [pathname]);

  return null;
}
