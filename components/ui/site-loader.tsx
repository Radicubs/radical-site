"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LatticeLoader from "@/components/LatticeLoader";
import { navigation, site } from "@/data/site";
import "./site-loader.css";

const SESSION_KEY = "radicubs-loaded";
const MIN_DURATION_MS = 900;
// Hard cap on the *visible* loading phase — waiting for all ~250 CMS images
// to finish would take 7s+. Instead we cap the blocking wait short and let
// the pool keep fetching the rest in the background after the loader hides
// (its workers aren't aborted, they just stop being awaited), so by the time
// someone actually clicks into another page most of it is already cached.
const MAX_WAIT_MS = 1300;
const FADE_DELAY_MS = 400;
const FADE_DURATION_MS = 350;
const PER_IMAGE_TIMEOUT_MS = 6000;
// The CMS's media host rate-limits bursts of simultaneous requests — a small
// pool keeps this looking like normal browser traffic while still getting
// enough images through the short blocking window.
const CONCURRENCY = 12;

type Phase = "active" | "exiting" | "hidden";
type Manifest = { images: string[]; heavy: string[] };

// An `Image()` with nothing else referencing it is fair game for the GC to
// collect mid-request, which silently aborts the load — this pool runs long
// after the component that kicked it off stops being awaited, so every
// in-flight image needs a live reference kept somewhere for its duration.
function preloadImage(url: string, keepAlive: Set<HTMLImageElement>): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    keepAlive.add(img);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      keepAlive.delete(img);
      resolve();
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = url;
    setTimeout(finish, PER_IMAGE_TIMEOUT_MS);
  });
}

async function preloadPool(urls: string[], concurrency: number, onSettle: () => void): Promise<void> {
  const keepAlive = new Set<HTMLImageElement>();
  let cursor = 0;
  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      await preloadImage(url, keepAlive);
      onSettle();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
}

export function SiteLoader() {
  const router = useRouter();
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

    // Warm the route cache for every nav destination so switching pages
    // doesn't wait on an RSC round-trip either.
    for (const item of navigation) router.prefetch(item.href);

    fetch("/api/asset-manifest")
      .then((res) => (res.ok ? (res.json() as Promise<Manifest>) : null))
      .then((manifest) => {
        if (cancelled || !manifest) {
          settleWithMinDuration();
          return;
        }

        // Heavy media (video, 3D models) just gets a background warm-up,
        // staggered so it doesn't add to the burst hitting the CMS host —
        // never blocks the loader either, it'd take far too long.
        manifest.heavy.forEach((url, i) => {
          setTimeout(() => fetch(url, { mode: "no-cors" }).catch(() => {}), i * 400);
        });

        const urls = manifest.images;
        if (!urls.length) {
          settleWithMinDuration();
          return;
        }

        setProgress({ loaded: 0, total: urls.length });
        const bump = () => setProgress((prev) => ({ ...prev, loaded: prev.loaded + 1 }));
        preloadPool(urls, CONCURRENCY, bump).then(() => {
          if (!cancelled) settleWithMinDuration();
        });
      })
      .catch(() => settleWithMinDuration());

    return () => {
      cancelled = true;
      clearTimeout(doneTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearTimeout(maxWaitTimer);
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
