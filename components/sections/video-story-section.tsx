"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeVideos } from "@/lib/cms";
import "./video-story-section.css";

type ScrollCraftWindow = Window & {
  ScrollCraft?: { mount: (root: Element) => void };
};

let enginePromise: Promise<void> | null = null;
function loadScrollCraft() {
  if ((window as ScrollCraftWindow).ScrollCraft) return Promise.resolve();
  if (!enginePromise) {
    enginePromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/robot/scrollcraft.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("ScrollCraft could not load"));
      document.head.appendChild(script);
    });
  }
  return enginePromise;
}

export function VideoStorySection({ videos }: { videos: HomeVideos }) {
  const rootRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // The engine, clip and poster (~2 MB together) wait until the section is
  // within ~¾ of a screen of view; a visitor who stays at the top never pays for them.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || near) return;
    if (!("IntersectionObserver" in window)) { setNear(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setNear(true);
    }, { rootMargin: "75% 0px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, [near]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !near) return;
    let active = true;
    loadScrollCraft().then(() => {
      if (!active || root.dataset.scMounted || !(window as ScrollCraftWindow).ScrollCraft) return;
      (window as ScrollCraftWindow).ScrollCraft?.mount(root);
      root.dataset.scMounted = "true";
    }).catch(() => {
      // The poster remains visible if the scroll engine cannot load.
    });
    return () => { active = false; };
  }, [near]);

  return <section className="film-story" aria-labelledby="film-story-title" ref={rootRef}>
    <div className="film-story-heading wrap">
      <div className="film-story-intro"><p className="film-story-kicker">Inside Radicubs</p><h2 id="film-story-title">The 2026 season.</h2><p>See our robot on the field. Scroll to watch the match unfold.</p></div>
    </div>
    <div className="film-story-act" data-sc-act="scrub" data-sc-span="3.1">
      <div className="film-story-stage" data-sc-stage>
        <video
          className="film-story-video"
          data-sc-scrub
          data-sc-src={videos.video}
          data-sc-src-mobile={videos.mobileVideo ?? videos.video}
          poster={near ? videos.poster : undefined}
          muted
          playsInline
          preload="none"
          aria-label="Radicubs robot 7503 competing on the field"
        />
      </div>
    </div>
  </section>;
}
