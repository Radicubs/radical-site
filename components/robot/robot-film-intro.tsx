"use client";

import { useEffect, useRef } from "react";
import { RobotMorphOverlay } from "./robot-morph-experience";

const VIDEO_END = 0.75;
const VIDEO_FPS = 48;

export function RobotFilmIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const morphProgress = useRef(0);

  useEffect(() => {
    const root = rootRef.current; const section = sectionRef.current; const video = videoRef.current;
    if (!root || !section || !video) return;
    let raf = 0; let duration = 7.94;
    const setDuration = () => { if (Number.isFinite(video.duration)) duration = video.duration; };
    video.addEventListener("loadedmetadata", setDuration); setDuration();
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect(); const stageHeight = Math.min(innerHeight, Math.max(1, innerHeight - (innerWidth <= 700 ? 89.6 : 108)));
      // Finish the complete video + morph timeline before the sticky stage hits
      // its containing-block boundary. This keeps the frame physically locked
      // beneath the nav for the entire handoff.
      const navClearance = Math.max(0, innerHeight - stageHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - stageHeight - navClearance)));
      const videoProgress = Math.min(1, progress / VIDEO_END);
      const morph = Math.min(1, Math.max(0, (progress - VIDEO_END) / (1 - VIDEO_END)));
      morphProgress.current = morph;
      root.style.setProperty("--story-p", progress.toFixed(4)); root.style.setProperty("--video-p", videoProgress.toFixed(4)); root.style.setProperty("--morph-p", morph.toFixed(4));
      if (video.readyState >= 2) {
        // The source is encoded at 48 fps. Snapping to real source frames
        // avoids asking the decoder to seek multiple times inside one frame.
        const next = Math.round(videoProgress * duration * VIDEO_FPS) / VIDEO_FPS;
        if (Math.abs(video.currentTime - next) >= 1 / VIDEO_FPS) video.currentTime = next;
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue);
    return () => { cancelAnimationFrame(raf); video.removeEventListener("loadedmetadata", setDuration); removeEventListener("scroll", queue); removeEventListener("resize", queue); };
  }, []);

  return <div className="robot-film" ref={rootRef}>
    <section className="robot-film__act" ref={sectionRef}>
      <div className="robot-film__stage">
        <img className="sc-stage__poster" src="/api/robot-assets/poster" alt="" />
        <video ref={videoRef} src="/api/robot-assets/approach" playsInline muted preload="auto" aria-label="Radicubs robot transition film" />
        <RobotMorphOverlay progress={morphProgress} />
        <div className="robot-film__vignette" aria-hidden="true" />
        <div className="robot-film__intro"><h1><span>Built to</span><strong>move.</strong></h1><p>The 2026 machine by Radicubs 7503.</p></div>
        <div className="robot-film__scroll-cue-anchor"><div className="robot-film__scroll-cue">Scroll to explore</div></div>
        <div className="robot-film__progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  </div>;
}
