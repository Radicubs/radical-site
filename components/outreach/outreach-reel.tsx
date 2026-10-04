"use client";

import Link from "@/components/ui/intent-link";
import { motion, type MotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { CmsImage, OutreachReelEvent } from "@/lib/cms";
import "./outreach-reel.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Where we've been": the section pins while vertical scroll pans a strip of event cards sideways.
 * Tagged data-sc-act="pan" so sideways trackpad swipes also drive it (see horizontal-wheel-lock).
 */
export function OutreachReel({ events }: { events: OutreachReelEvent[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // Horizontal distance the track needs to move; the section is made that much taller than the viewport.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduce) return;
    const measure = () => setTravel(Math.max(0, track.scrollWidth - track.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * travel);
  const imageShift = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(events.length - 1, Math.round(v * (events.length - 1)))));

  const pinned = !reduce && travel > 0;

  return <section
    ref={sectionRef}
    className="outreach-reel"
    data-pinned={pinned || undefined}
    data-sc-act={pinned ? "pan" : undefined}
    style={pinned ? { height: `calc(100svh + ${travel}px)` } : undefined}
    aria-labelledby="outreach-reel-title"
  >
    <div className="outreach-reel-stage">
      <div className="wrap outreach-reel-head">
        <div>
          <p className="outreach-eyebrow">On the road</p>
          <h2 id="outreach-reel-title">Where we&apos;ve <em>been.</em></h2>
        </div>
        <div className="outreach-reel-meter" aria-hidden="true">
          <span className="outreach-reel-count"><strong>{pad(active + 1)}</strong> / {pad(events.length)}</span>
          <span className="outreach-reel-bar"><motion.span style={{ scaleX: reduce ? 1 : scrollYProgress }} /></span>
        </div>
      </div>
      <motion.ol ref={trackRef} className="outreach-reel-track" data-pan-track style={pinned ? { x } : undefined}>
        {events.map((event, i) => <li key={`${event.year}-${event.title}`} data-active={i === active || undefined}>
          <ReelCard event={event} image={event.photo} index={i} imageShift={pinned ? imageShift : undefined} />
        </li>)}
      </motion.ol>
    </div>
  </section>;
}

function ReelCard({ event, image, index, imageShift }: { event: OutreachReelEvent; image?: CmsImage; index: number; imageShift?: MotionValue<string> }) {
  const inner = <>
    {image
      ? <span className={`outreach-reel-photo${event.fit === "contain" ? " outreach-reel-photo--contain" : ""}`}>
          <motion.img src={image.src} srcSet={image.srcSet} sizes="(max-width: 760px) 90vw, 420px" alt="" loading="lazy" decoding="async" draggable={false} style={event.fit === "contain" || !imageShift ? undefined : { x: imageShift }} />
        </span>
      : <span className="outreach-reel-ghost" aria-hidden="true">{event.year}</span>}
    <span className="outreach-reel-meta">
      <span className="outreach-reel-year">{event.year} <span>· {pad(index + 1)}</span></span>
      <strong>{event.title}</strong>
      <span className="outreach-reel-place">{event.place}</span>
      {event.source && <span className="outreach-reel-read" aria-hidden="true">Read the post ↗</span>}
    </span>
  </>;

  return event.source
    ? <Link className="outreach-cell outreach-reel-card" href={event.source} draggable={false} aria-label={`${event.title}, ${event.year}, ${event.place}. Read the blog post`}>{inner}</Link>
    : <div className="outreach-cell outreach-reel-card">{inner}</div>;
}
