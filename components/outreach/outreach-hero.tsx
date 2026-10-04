"use client";

import { useEffect, useRef, useState } from "react";
import "./outreach-hero.css";

/** Full-bleed hero: the RadiCamp film loops behind a small caption. The only control is mute/unmute. */
export function OutreachHero({ video, poster }: { video?: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Respect reduced motion (poster only) and stop decoding while the tab is hidden.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches || document.hidden) el.pause();
      else void el.play().catch(() => {});
    };
    sync();
    reduce.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  function toggleSound() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) void el.play().catch(() => {});
  }

  return <section className="outreach-hero" aria-labelledby="outreach-hero-title">
    <div className="outreach-hero-media">
      {video
        ? <video ref={videoRef} className="outreach-hero-video" src={video} poster={poster} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" tabIndex={-1} />
        : poster && <img className="outreach-hero-video" src={poster} alt="" />}
    </div>
    <div className="wrap outreach-hero-bar">
      <div className="outreach-hero-caption">
        <h1 id="outreach-hero-title">Outreach</h1>
        <p><span className="outreach-hero-dot" aria-hidden="true" />RadiCamp 2026<span className="outreach-hero-sub"><span className="outreach-hero-sep">·</span>Our summer robotics camp</span></p>
      </div>
      {video && <button type="button" className="outreach-hero-mute" data-muted={muted || undefined} onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Unmute video" : "Mute video"}>
        <svg viewBox="0 0 28 24" width="28" height="24" aria-hidden="true">
          <path d="M3 9v6h4l5 4.5v-15L7 9H3z" fill="currentColor" />
          <path className="outreach-mute-wave" d="M16 8.5a5 5 0 0 1 0 7" pathLength={1} />
          <path className="outreach-mute-wave outreach-mute-wave--outer" d="M19 5.5a9 9 0 0 1 0 13" pathLength={1} />
          <path className="outreach-mute-x" d="M17 9l6 6" pathLength={1} />
          <path className="outreach-mute-x outreach-mute-x--second" d="M23 9l-6 6" pathLength={1} />
        </svg>
      </button>}
    </div>
  </section>;
}
