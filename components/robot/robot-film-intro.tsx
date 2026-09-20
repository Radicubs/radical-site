"use client";

import { useEffect, useRef } from "react";

export function RobotFilmIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current; const section = sectionRef.current; const video = videoRef.current;
    if (!root || !section || !video) return;
    let raf = 0; let duration = 19.07; let targetTime = 0;
    const setDuration = () => { if (Number.isFinite(video.duration)) duration = video.duration; };
    const seekToTarget = () => {
      if (video.readyState < 2 || video.seeking) return;
      if (Math.abs(video.currentTime - targetTime) >= 1 / 30) video.currentTime = targetTime;
    };
    const finishPendingSeek = () => seekToTarget();
    video.addEventListener("loadedmetadata", setDuration); setDuration();
    video.addEventListener("seeked", finishPendingSeek);
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect(); const stageHeight = Math.min(innerHeight, Math.max(1, innerHeight - (innerWidth <= 700 ? 89.6 : 108)));
      // Finish the complete video before the sticky stage reaches its
      // containing-block boundary, keeping the film locked beneath the nav.
      const navClearance = Math.max(0, innerHeight - stageHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - stageHeight - navClearance)));
      const videoProgress = progress;
      root.style.setProperty("--story-p", progress.toFixed(4)); root.style.setProperty("--video-p", videoProgress.toFixed(4));
      // Keep only the newest requested frame while a prior seek is decoding.
      // The scroll-optimized source has a keyframe every six frames, so each
      // seek requires at most 0.2 seconds of video decoding.
      targetTime = videoProgress * Math.max(0, duration - 1 / 30);
      seekToTarget();
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue);
    return () => { cancelAnimationFrame(raf); video.removeEventListener("loadedmetadata", setDuration); video.removeEventListener("seeked", finishPendingSeek); removeEventListener("scroll", queue); removeEventListener("resize", queue); };
  }, []);

  return <div className="robot-film" ref={rootRef}>
    <section className="robot-film__act" ref={sectionRef}>
      <div className="robot-film__stage">
        <video ref={videoRef} src="/robot/fullvideo-scroll.mp4" playsInline muted preload="auto" aria-label="Radicubs robot film" />
        <div className="robot-film__vignette" aria-hidden="true" />
        <div className="robot-film__intro"><h1><span>Built to</span><strong>move.</strong></h1><p>The 2026 machine by Radicubs 7503.</p></div>
        <div className="robot-film__scroll-cue-anchor"><div className="robot-film__scroll-cue">Scroll to explore</div></div>
        <div className="robot-film__progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  </div>;
}
