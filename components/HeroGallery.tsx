"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MorphEngine } from "@/components/morph-engine";
import type { GalleryAlbum } from "@/lib/cms";
import "./HeroGallery.css";

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;

export function HeroGallery({ album }: { album: GalleryAlbum }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageHostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const suppressClick = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const photos = album.photos;

  const move = useCallback((step: number) => {
    engineRef.current?.goTo(step);
  }, []);

  useEffect(() => {
    const host = stageHostRef.current;
    if (!host || photos.length < 1) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new MorphEngine(host, {
      images: photos.map((photo) => photo.src),
      startIndex: 0,
      reducedMotion,
      dprCap: 2,
      getOptions: () => ({
        transition: "melt",
        duration: 0.9,
        ease: "power2.inOut",
        intensity: 0.5,
        scale: 2.2,
        aberration: 0.3,
        drift: 0.35,
        overlayColor: "#090d0a",
        loop: true,
      }),
      onIndexChange: setIndex,
    });
    engineRef.current = engine;
    setIndex(0);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const setTiltSuspended = (suspended: boolean) => {
    if (!panelRef.current) return;
    panelRef.current.dataset.tiltSuspended = String(suspended);
  };

  const finishDrag = (offset: number, velocity: number) => {
    suppressClick.current = Math.abs(offset) > 8;
    if (offset < -SWIPE_DISTANCE || velocity < -SWIPE_VELOCITY) move(1);
    else if (offset > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY) move(-1);
    setTiltSuspended(false);
    window.setTimeout(() => { suppressClick.current = false; }, 80);
  };

  const startPointerSwipe = (clientX: number, suspendTilt = true) => {
    pointerStartX.current = clientX;
    if (suspendTilt) setTiltSuspended(true);
  };

  const finishPointerSwipe = (clientX: number) => {
    if (pointerStartX.current === null) return;
    const offset = clientX - pointerStartX.current;
    pointerStartX.current = null;
    finishDrag(offset, 0);
  };

  const openLightbox = () => {
    if (suppressClick.current) return;
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    window.setTimeout(() => openButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeLightbox, lightboxOpen, move]);

  if (!photos.length) return null;
  const active = photos[index];
  const variants = {
    enter: { opacity: 0, scale: 1.035 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: .985 }
  };

  return (
    <>
      <div className="robot-card gallery-card" data-tilt-card ref={panelRef}>
        <div className="gallery-stage">
          <div
            ref={stageHostRef}
            className="gallery-canvas-host"
            onPointerDown={(event) => startPointerSwipe(event.clientX)}
            onPointerUp={(event) => finishPointerSwipe(event.clientX)}
            onPointerCancel={() => { pointerStartX.current = null; setTiltSuspended(false); }}
          />

          <button ref={openButtonRef} className="gallery-open" type="button" onClick={openLightbox} aria-label={`Open ${active.alt} in full screen`}>
            <Expand size={17} aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <>
              <button className="gallery-side-arrow gallery-side-arrow-previous" type="button" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft size={20} /></button>
              <button className="gallery-side-arrow gallery-side-arrow-next" type="button" onClick={() => move(1)} aria-label="Next photo"><ChevronRight size={20} /></button>
              <div className="gallery-controls">
                <div className="gallery-caption">
                  <span>{album.title}</span>
                  <strong aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${album.title} photo viewer`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="gallery-lightbox-backdrop" type="button" onClick={closeLightbox} aria-label="Close full-screen photo" />
            <button className="gallery-lightbox-close" type="button" onClick={closeLightbox} autoFocus aria-label="Close full-screen photo"><X size={22} /></button>
            <div className="gallery-lightbox-stage">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={`lightbox-${active.id}`}
                  src={active.fullSrc}
                  alt={active.alt}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: .28, ease: [0.22, 1, 0.36, 1] }}
                  drag={photos.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={.12}
                  onPointerDown={(event) => startPointerSwipe(event.clientX, false)}
                  onPointerUp={(event) => finishPointerSwipe(event.clientX)}
                  onPointerCancel={() => { pointerStartX.current = null; }}
                  decoding="async"
                />
              </AnimatePresence>
            </div>
            {photos.length > 1 && (
              <div className="gallery-lightbox-nav">
                <button type="button" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft size={21} /></button>
                <span>{album.title} · {index + 1} / {photos.length}</span>
                <button type="button" onClick={() => move(1)} aria-label="Next photo"><ChevronRight size={21} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
