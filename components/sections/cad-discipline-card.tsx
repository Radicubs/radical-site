"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import type { ModelViewerHandle } from "@/components/ModelViewer";
import type { DisciplineCard } from "@/lib/cms";

const MODEL_URL = "/models/2026-robot-viewer-v2.glb";
const ENVIRONMENT_URL = "/models/studio-small-03-256.hdr";
const ModelViewer = dynamic(() => import("@/components/ModelViewer"), { ssr: false });
const faceAngle = (back: boolean, current: number) => {
  const base = back ? 180 : 0;
  return base + Math.round((current - base) / 360) * 360;
};

class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p className="disc-model-status" role="status">The 3D preview couldn’t load. <a href={MODEL_URL} download>Download the model</a> to view it.</p>
      : this.props.children;
  }
}

export function CadDisciplineCard({ discipline, index }: { discipline: DisciplineCard; index: number }) {
  const [details, setDetails] = useState(false);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerHandle>(null);
  const reduceMotion = useReducedMotion();
  const turn = useMotionValue(0);
  const spin = useRef<AnimationPlaybackControls | null>(null);
  const grip = useRef<{ id: number; x: number; y: number; base: number; moved: boolean; delta: number } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    spin.current?.stop();
    if (reduceMotion) turn.set(0);
    else spin.current = animate(turn, faceAngle(details, turn.get()), { type: "spring", stiffness: 170, damping: 20, restDelta: 0.05 });
    return () => spin.current?.stop();
  }, [details, reduceMotion, turn]);

  const release = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = grip.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    grip.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!gesture.moved) return; // The click handler handles ordinary clicks.
    suppressClick.current = true;
    const threshold = Math.min(72, Math.max(36, event.currentTarget.clientWidth * 0.22));
    const next = !cancelled && Math.abs(gesture.delta) >= threshold ? !details : details;
    if (next !== details) setDetails(next);
    else if (!reduceMotion) spin.current = animate(turn, faceAngle(details, turn.get()), { type: "spring", stiffness: 170, damping: 20 });
  };

  // Mount the viewer once the page settles, so the code, model, lighting and shaders are
  // all ready before anyone scrolls this far. Data-saver visitors still load on approach.
  useEffect(() => {
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const start = () => setInView(true);
    let idle: number | undefined;
    let timer: number | undefined;
    const schedule = () => {
      idle = window.requestIdleCallback?.(start, { timeout: 2500 });
      if (idle === undefined) timer = window.setTimeout(start, 600);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: "1200px" });
    if (card.current) observer.observe(card.current);
    return () => observer.disconnect();
  }, []);

  const header = (back: boolean) => <header className="disc-head-row">
          <span className="disc-index">{String(index).padStart(2, "0")}</span>
          <h3>{discipline.title}</h3>
          <div className="disc-model-actions">
          <button type="button" className="disc-flip disc-model-toggle disc-model-reset" aria-label="Recenter CAD model" title="Recenter model" onClick={() => { viewer.current?.reset(); setDetails(false); }}>
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 1v4m0 6v4M1 8h4m6 0h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
          <button type="button" className="disc-flip disc-model-toggle" aria-label={back ? "View CAD model" : "Read about CAD"} title={back ? "Flip to model" : "Flip for details"} onClick={() => setDetails(!details)}>
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M13 5.5A5.5 5.5 0 1 0 13.5 9M13.6 2.2v3.6H10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          </div>
        </header>;

  return <div ref={card} className="disc-card flip-card disc-model-card" data-draggable="" data-dragging={dragging ? "" : undefined} data-fade={reduceMotion ? (details ? "back" : "front") : undefined}
  onPointerDown={event => {
    if (event.button !== 0 || grip.current) return;
    suppressClick.current = false;
    // Only gestures that START outside the viewer/buttons belong to the card.
    if ((event.target as Element).closest(".disc-model, button, a")) return;
    grip.current = { id: event.pointerId, x: event.clientX, y: event.clientY, base: turn.get(), moved: false, delta: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }}
  onPointerMove={event => {
    const gesture = grip.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved) {
      const slop = event.pointerType === "touch" ? 10 : 6;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < slop) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        grip.current = null; // Let vertical swipes scroll the page.
        suppressClick.current = true;
        event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      gesture.moved = true;
      gesture.base = turn.get();
      spin.current?.stop();
      setDragging(true);
    }
    gesture.delta = dx;
    if (!reduceMotion) turn.set(gesture.base + Math.max(-180, Math.min(180, dx / 260 * 180)));
  }}
  onPointerUp={event => release(event)}
  onPointerCancel={event => release(event, true)}
  onLostPointerCapture={event => release(event, true)}
  onClick={event => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if ((event.target as Element).closest(".disc-model, button, a")) return;
    setDetails(!details);
  }}>
    <motion.div className="flip-card__rotor" style={{ rotateY: turn }}>
    <div className="flip-card__face flip-card__face--front" aria-hidden={details} inert={details}>
      <div className="disc-face">
        <span className="disc-ticks" aria-hidden="true" />
        {header(false)}
        <div className="disc-photo disc-model">
          <ModelBoundary>
            {!loaded && <p className="disc-model-status" role="status">Loading 3D model…</p>}
            {inView && <ModelViewer
              ref={viewer}
              url={MODEL_URL}
              width="100%"
              height="100%"
              environmentFiles={ENVIRONMENT_URL}
              environmentIntensity={1.6}
              exposure={1.15}
              modelRotation={[-Math.PI / 2, 0, 0]}
              autoRotate={false}
              float={0}
              hoverTilt={0}
              intro="none"
              startAngle={145}
              tilt={18}
              fit={1.25}
              shadow={false}
              onModelLoaded={() => setLoaded(true)}
            />}
          </ModelBoundary>
        </div>
        <span className="disc-hint"><span className="disc-hint-pointer">Drag to rotate · Ctrl + scroll to zoom</span><span className="disc-hint-touch">Drag to rotate · Pinch to zoom</span></span>
      </div>
    </div>
    <div className="flip-card__face flip-card__face--back" aria-hidden={!details} inert={!details}>
      <div className="disc-face disc-face--back" data-index={String(index).padStart(2, "0")}>
        <span className="disc-ticks" aria-hidden="true" />
        {header(true)}
        <p>{discipline.copy}</p>
        <ul className="disc-skills">{discipline.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        <span className="disc-hint"><span className="disc-hint-pointer">Click to flip back</span><span className="disc-hint-touch">Tap to flip back</span></span>
      </div>
    </div>
    </motion.div>
  </div>;
}
