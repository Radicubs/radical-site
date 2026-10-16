"use client";

import { useEffect, useRef, useState } from "react";
import "./site-loader.css";

const SESSION_KEY = "radicubs-loaded-v2";
// Matches --cube-cycle. The loader always plays one full fold and exits just after a
// cycle boundary, inside the 0-8% hold where a lone cube sits at -33deg for the exit to aim at.
const CYCLE = 3200;
const EXIT_OFFSET = 80;
const MAX_CYCLES = 2;
// Last moment of the 0-8% hold, with margin for the frame it takes to apply the exit.
const HOLD_END = CYCLE * 0.08 - 50;
// Past this, exit even mid-fold (dropping the loop snaps it back to the lone cube).
const HARD_LIMIT = CYCLE * (MAX_CYCLES + 1) + EXIT_OFFSET;
const REDUCED_MAX_WAIT = 1500;
const EXIT_DURATION = 1000;

function Cube({ className = "site-loader-cube" }: { className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: 6 }, (_, i) => <span key={i} className="site-loader-face" />)}
    </div>
  );
}

// Each level is the previous level plus a copy hinged on one of its edges.
function Fold({ axes }: { axes: readonly ("x" | "z" | "y")[] }) {
  if (axes.length === 0) return <Cube />;
  const inner = axes.slice(0, -1);
  return (
    <div className="site-loader-fold">
      <Fold axes={inner} />
      <div className="site-loader-copy" data-axis={axes[axes.length - 1]}><Fold axes={inner} /></div>
    </div>
  );
}

type Phase = "loading" | "leaving" | "hidden";

export function SiteLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-skip-loader")) {
      setPhase("hidden");
      return;
    }

    let disposed = false;
    let finished = false;
    let minimumTimer: ReturnType<typeof setTimeout> | undefined;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const cleanups: (() => void)[] = [];
    const started = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = document.querySelector<HTMLElement>(".site-content");
    const previousInert = content?.inert ?? false;
    if (content) content.inert = true;

    const finish = () => {
      if (disposed || finished) return;
      // Timers fall behind the compositor while hydration blocks the main thread, so a late
      // timer can land mid-fold. Check the animation's own clock and wait for the next rest.
      const time = elapsed();
      if (!reduced && (time < CYCLE || time % CYCLE > HOLD_END) && time < HARD_LIMIT) {
        clearTimeout(minimumTimer);
        minimumTimer = setTimeout(finish, untilExitPoint());
        return;
      }
      finished = true;
      clearTimeout(maximumTimer);
      clearTimeout(minimumTimer);
      // Start the exit now rather than whenever React commits; the CSS drops the loop to its resting pose.
      loaderRef.current?.setAttribute("data-phase", "leaving");
      setPhase("leaving");
      if (content) content.inert = previousInert;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Storage is optional. */ }
      exitTimer = setTimeout(() => setPhase("hidden"), reduced ? 100 : EXIT_DURATION);
    };

    // CSS animations start with the server-rendered markup, before hydration, so read their clock.
    const animation = loaderRef.current?.querySelector(".site-loader-scale")?.getAnimations()[0];
    const elapsed = () => {
      const time = animation?.currentTime;
      return typeof time === "number" ? time : performance.now() - started;
    };
    const untilExitPoint = () => {
      const time = elapsed();
      if (time < CYCLE + EXIT_OFFSET) return CYCLE + EXIT_OFFSET - time;
      return (EXIT_OFFSET - (time % CYCLE) + CYCLE) % CYCLE;
    };

    const maximumTimer = setTimeout(finish, reduced ? REDUCED_MAX_WAIT : Math.max(0, CYCLE * MAX_CYCLES + EXIT_OFFSET - elapsed()));
    const frame = requestAnimationFrame(() => {
      const visibleImages = Array.from(document.images).filter((image) => {
        const rect = image.getBoundingClientRect();
        return !image.complete && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      });
      const assets = visibleImages.map((image) => new Promise<void>((resolve) => {
        const settle = () => {
          image.removeEventListener("load", settle);
          image.removeEventListener("error", settle);
          resolve();
        };
        image.addEventListener("load", settle, { once: true });
        image.addEventListener("error", settle, { once: true });
        cleanups.push(settle);
        if (image.complete) settle();
      }));
      Promise.allSettled([...assets, document.fonts.ready]).then(() => {
        if (disposed || finished) return;
        minimumTimer = setTimeout(finish, reduced ? 0 : untilExitPoint());
      });
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(maximumTimer);
      clearTimeout(minimumTimer);
      clearTimeout(exitTimer);
      cleanups.forEach((cleanup) => cleanup());
      if (content) content.inert = previousInert;
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div ref={loaderRef} className="site-loader" data-phase={phase} role="status" aria-live="polite" aria-label="Loading Radicubs" aria-busy={phase === "loading"}>
      <div className="site-loader-backdrop" />
      <div className="site-loader-stage" aria-hidden="true">
        <div className="site-loader-camera">
          <div className="site-loader-spin">
            <div className="site-loader-scale">
              <div className="site-loader-root"><Fold axes={["x", "z", "y"]} /></div>
              <Cube className="site-loader-shell" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading Radicubs</span>
    </div>
  );
}
