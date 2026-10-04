"use client";

import { useEffect, useState } from "react";
import LatticeLoader from "@/components/LatticeLoader";
import { site } from "@/data/site";
import "./site-loader.css";

const SESSION_KEY = "radicubs-loaded";
const MIN_DURATION_MS = 900;
// Hard cap on the visible loading phase so a slow image never holds the
// boot screen; anything unfinished keeps loading behind the page.
const MAX_WAIT_MS = 1300;
const FADE_DELAY_MS = 400;
const FADE_DURATION_MS = 350;

type Phase = "active" | "exiting" | "hidden";

// Waits only for images the current page has already put on screen. The
// browser is fetching those anyway, so the loader costs no extra bandwidth —
// it never downloads assets for pages the visitor may not open.
function pendingVisibleImages(): HTMLImageElement[] {
  const viewportHeight = window.innerHeight;
  return Array.from(document.images).filter((img) => {
    if (img.complete || img.closest(".site-loader")) return false;
    const rect = img.getBoundingClientRect();
    return rect.width > 0 && rect.bottom > 0 && rect.top < viewportHeight;
  });
}

function whenSettled(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete) return resolve();
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

export function SiteLoader() {
  const [phase, setPhase] = useState<Phase>("active");
  const [status, setStatus] = useState<"working" | "done">("working");
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-skip-loader")) {
      setPhase("hidden");
      return;
    }

    let cancelled = false;
    const startedAt = performance.now();
    let doneTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let maxWaitTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(maxWaitTimer);
      setStatus("done");
      fadeTimer = setTimeout(() => setPhase("exiting"), FADE_DELAY_MS);
      hideTimer = setTimeout(() => {
        setPhase("hidden");
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // ignore storage errors (private mode, etc.)
        }
      }, FADE_DELAY_MS + FADE_DURATION_MS);
    };

    const settleWithMinDuration = () => {
      const elapsed = performance.now() - startedAt;
      doneTimer = setTimeout(finish, Math.max(0, MIN_DURATION_MS - elapsed));
    };

    // Absolute ceiling: never leave a visitor staring at the boot screen if
    // the CMS or an asset hangs — move on and let the page finish loading normally.
    maxWaitTimer = setTimeout(finish, MAX_WAIT_MS);

    // Let the first commit lay out before measuring what is on screen.
    const measureFrame = requestAnimationFrame(() => {
      if (cancelled) return;
      const images = pendingVisibleImages();
      if (!images.length) {
        settleWithMinDuration();
        return;
      }
      setProgress({ loaded: 0, total: images.length });
      const bump = () => setProgress((prev) => ({ ...prev, loaded: prev.loaded + 1 }));
      Promise.all(images.map((img) => whenSettled(img).then(bump))).then(() => {
        if (!cancelled) settleWithMinDuration();
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(doneTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearTimeout(maxWaitTimer);
      cancelAnimationFrame(measureFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "hidden") return null;

  const label = progress.total > 0 && status === "working"
    ? `Loading assets ${progress.loaded}/${progress.total}`
    : "Booting systems";

  return (
    <div className={`site-loader site-loader--${phase}`} aria-hidden="true">
      <div className="site-loader-grid" />
      <div className="site-loader-content">
        <div className="site-loader-mark">
          <img src={site.markImage} alt="" />
        </div>
        <div className="site-loader-brand">
          <span className="site-loader-name">{site.name}</span>
          <span className="site-loader-team">FRC TEAM {site.teamNumber}</span>
        </div>
        <div className="site-loader-lattice">
          <LatticeLoader
            status={status}
            label={label}
            doneLabel="Ready in"
            errorLabel="Failed after"
            pattern="orbit"
            grid={3}
            shape="square"
            color="#66ff55"
            doneColor="#8bff7a"
            errorColor="#ef4444"
            cellSize={7}
            gap={3}
            fontSize={14}
            step={90}
            idleOpacity={0.15}
            glow
            glowColor="#66ff55"
            showTimer
          />
        </div>
      </div>
    </div>
  );
}
