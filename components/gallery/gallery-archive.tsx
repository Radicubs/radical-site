"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryAlbum, GalleryPhoto } from "@/lib/cms";
import { lenisRef } from "@/components/ui/lenis-singleton";
import { GalleryTetris } from "./gallery-tetris";
import "./gallery-archive.css";

const ROW_RATIO = 0.75;
const columnsFor = (width: number) => (width >= 1000 ? 4 : width >= 640 ? 3 : 2);
const gapFor = (width: number) => (width >= 640 ? 20 : 10);

type Shape = [cols: number, rows: number];
type Piece =
  | { kind: "year"; key: string; year: number | null; events: number; photos: number }
  | { kind: "event"; key: string; title: string; photos: number }
  | { kind: "photo"; key: string; photo: GalleryPhoto; index: number };
type Placed = { piece: Piece; x: number; y: number; w: number; h: number };

// Preferred footprint first, then smaller fallbacks. 1×1 always fits, so the pack never leaves holes.
function shapesFor(piece: Piece, ratio: number): Shape[] {
  if (piece.kind === "year") return [[2, 1], [1, 1]];
  if (piece.kind === "event") return [[1, 1]];
  if (ratio > 1.15) return [[1, 2], [1, 1]];
  if (ratio < 0.6) return [[2, 1], [1, 1]];
  // A fixed rhythm of bigger pieces keeps long albums from settling into a flat wall.
  if (piece.index % 11 === 0) return [[2, 2], [2, 1], [1, 1]];
  if (piece.index % 11 === 6) return [[2, 1], [1, 1]];
  return [[1, 1]];
}

// Tetris-style pack: every piece lands on the first empty cell in reading order,
// in its biggest shape that still fits there. Order is preserved, so a new year
// simply starts wherever the previous one stopped, mid-row included.
function pack(pieces: Piece[], ratios: Record<string, number>, columns: number) {
  const filled: boolean[][] = [];
  const isFree = (col: number, row: number) => col < columns && !filled[row]?.[col];
  const out: Array<{ piece: Piece; col: number; row: number; cols: number; rows: number }> = [];
  let cursor = 0;
  for (const piece of pieces) {
    while (!isFree(cursor % columns, Math.floor(cursor / columns))) cursor++;
    const col = cursor % columns, row = Math.floor(cursor / columns);
    const ratio = piece.kind === "photo" ? ratios[piece.photo.id] ?? 0.75 : 1;
    const fits = ([c, r]: Shape) => Array.from({ length: r }, (_, dy) => Array.from({ length: c }, (_, dx) => isFree(col + dx, row + dy)).every(Boolean)).every(Boolean);
    const [cols, rows] = shapesFor(piece, ratio).map(([c, r]) => [Math.min(c, columns), r] as Shape).find(fits) ?? [1, 1];
    for (let dy = 0; dy < rows; dy++) for (let dx = 0; dx < cols; dx++) (filled[row + dy] ??= [])[col + dx] = true;
    out.push({ piece, col, row, cols, rows });
  }
  return { out, rows: filled.length };
}

function TetrisGrid({ albums, onOpen }: { albums: GalleryAlbum[]; onOpen: (photo: GalleryPhoto, el: HTMLButtonElement) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const revealed = useRef(new Set<string>());
  const photos = useMemo(() => albums.flatMap((album) => album.photos), [albums]);
  // Pack immediately from upload metadata. Waiting for every thumbnail blocks
  // the entire gallery on its slowest image and defeats lazy loading.
  const ratios = useMemo(() => Object.fromEntries(photos.map((photo) => [
    photo.id, photo.width > 0 && photo.height > 0 ? photo.height / photo.width : ROW_RATIO
  ])), [photos]);
  const eagerPhotos = useMemo(() => new Set(photos.slice(0, 4).map((photo) => photo.id)), [photos]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pieces = useMemo(() => {
    const years = [...new Set(albums.map((album) => album.year))];
    return years.flatMap((year): Piece[] => {
      const inYear = albums.filter((album) => album.year === year);
      return [
        { kind: "year", key: `year-${year ?? "other"}`, year, events: inYear.length, photos: inYear.reduce((n, album) => n + album.photos.length, 0) },
        ...inYear.flatMap((album): Piece[] => [
          { kind: "event", key: `event-${album.title}-${album.photos[0]?.id}`, title: album.title, photos: album.photos.length },
          ...album.photos.map((photo, index): Piece => ({ kind: "photo", key: photo.id, photo, index }))
        ])
      ];
    });
  }, [albums]);

  const { items, height } = useMemo((): { items: Placed[]; height: number } => {
    if (!width) return { items: [], height: 0 };
    const columns = columnsFor(width), gap = gapFor(width);
    const cell = (width - gap * (columns - 1)) / columns;
    const rowH = cell * ROW_RATIO;
    const { out, rows } = pack(pieces, ratios, columns);
    return {
      items: out.map(({ piece, col, row, cols, rows: r }) => ({ piece, x: col * (cell + gap), y: row * (rowH + gap), w: cols * cell + (cols - 1) * gap, h: r * rowH + (r - 1) * gap })),
      height: Math.max(0, rows * (rowH + gap) - gap)
    };
  }, [pieces, width, ratios]);

  // Blocks drop into place in chunky steps as they scroll into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || !items.length) return;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>(".gallery-block")).filter((tile) => !revealed.current.has(tile.dataset.key!));
    if (!tiles.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { tiles.forEach((tile) => revealed.current.add(tile.dataset.key!)); return; }
    gsap.set(tiles, { opacity: 0, y: -48 });
    const observer = new IntersectionObserver((entries) => {
      const hits = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement)
        .sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);
      if (!hits.length) return;
      hits.forEach((tile) => { observer.unobserve(tile); revealed.current.add(tile.dataset.key!); });
      gsap.to(hits, { opacity: 1, y: 0, duration: 0.42, ease: "steps(4)", stagger: 0.045, clearProps: "transform,opacity" });
    }, { rootMargin: "0px 0px -8% 0px" });
    tiles.forEach((tile) => observer.observe(tile));
    return () => {
      observer.disconnect();
      gsap.killTweensOf(tiles);
      gsap.set(tiles, { clearProps: "transform,opacity" });
    };
  }, [items]);

  return (
    <div ref={ref} className="gallery-tetris" style={{ height: width ? height : 360 }}>
      {items.map(({ piece, x, y, w, h }) => {
        const style = { left: x, top: y, width: w, height: h };
        if (piece.kind === "year") return (
          <div className="gallery-block gallery-year-block" key={piece.key} data-key={piece.key} style={style}>
            <h2>{piece.year ?? "Other"}</h2>
            <p>{piece.events} {piece.events === 1 ? "event" : "events"} · {piece.photos} photos</p>
          </div>
        );
        if (piece.kind === "event") return (
          <div className="gallery-block gallery-event-block" key={piece.key} data-key={piece.key} style={style}>
            <h3>{piece.title}</h3>
            <p>{piece.photos} {piece.photos === 1 ? "photo" : "photos"}</p>
          </div>
        );
        const { photo } = piece;
        return (
          <button
            className="gallery-block gallery-photo"
            type="button"
            key={piece.key}
            data-key={piece.key}
            style={style}
            onClick={(event) => onOpen(photo, event.currentTarget)}
            aria-label={`Open ${photo.alt} full screen`}
          >
            <motion.img
              layoutId={`gallery-${photo.id}`}
              src={w > 400 ? photo.src : photo.thumbSrc}
              srcSet={photo.srcSet ?? `${photo.thumbSrc} 320w, ${photo.src} 800w`}
              sizes={`${Math.round(w)}px`}
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              loading={eagerPhotos.has(photo.id) ? "eager" : "lazy"}
              decoding="async"
            />
          </button>
        );
      })}
    </div>
  );
}

export function GalleryArchive({ albums: unsorted }: { albums: GalleryAlbum[] }) {
  // Newest year first; the grid and the lightbox arrows share this order.
  const albums = useMemo(() => [...unsorted].sort((a, b) => (b.year ?? -1) - (a.year ?? -1)), [unsorted]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // After arrow navigation the tile may be off-screen, so stop morphing from/to it.
  const [navigated, setNavigated] = useState(false);
  const photos = useMemo(() => albums.flatMap((album) => album.photos), [albums]);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    window.setTimeout(() => lastTrigger.current?.focus({ preventScroll: true }), 0);
  }, []);
  const step = useCallback((delta: number) => {
    setNavigated(true);
    setOpenIndex((current) => current === null ? null : (current + delta + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenisRef.current?.stop();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      lenisRef.current?.start();
      window.removeEventListener("keydown", keydown);
    };
  }, [openIndex === null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (photo: GalleryPhoto, button: HTMLButtonElement) => {
    lastTrigger.current = button;
    setNavigated(false);
    setOpenIndex(photos.indexOf(photo));
  };
  const active = openIndex === null ? null : photos[openIndex];

  // The grid "breaks apart" into the game: blocks tumble away, the board takes the
  // grid's place in the same section, and the page glides to frame it.
  const [playing, setPlaying] = useState(false);
  const toolbar = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gridBlocks = () => document.querySelectorAll<HTMLElement>(".gallery-tetris .gallery-block");

  const startGame = () => {
    const blocks = gridBlocks();
    if (reduced() || !blocks.length) { setPlaying(true); return; }
    gsap.to(blocks, {
      y: () => window.innerHeight * (0.6 + Math.random() * 0.6),
      rotation: () => (Math.random() - 0.5) * 50,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      stagger: { amount: 0.35, from: "random" },
      onComplete: () => setPlaying(true)
    });
  };
  const stopGame = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const el = toolbar.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    if (lenisRef.current) lenisRef.current.scrollTo(top, { duration: reduced() ? 0 : 1.1 });
    else window.scrollTo({ top, behavior: reduced() ? "auto" : "smooth" });
    if (playing) return;
    // Back to the gallery: the blocks drop back into place.
    const blocks = gridBlocks();
    if (reduced()) { gsap.set(blocks, { clearProps: "transform,opacity" }); return; }
    gsap.fromTo(blocks, { y: -48, rotation: 0, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "steps(4)", stagger: { amount: 0.5, from: "start" }, clearProps: "transform,opacity", delay: 0.2 });
  }, [playing]);

  return <LayoutGroup>
    <div ref={toolbar}>
      {playing
        ? <GalleryTetris photos={photos} onClose={stopGame} />
        : <div className="gallery-toolbar">
          <p>{photos.length} photos · {albums.length} events</p>
          <button className="gallery-play" type="button" onClick={startGame}>
            <svg viewBox="0 0 3 2" aria-hidden="true"><rect x="0" y="0" width=".9" height=".9" /><rect x="1" y="0" width=".9" height=".9" /><rect x="2" y="0" width=".9" height=".9" /><rect x="1" y="1" width=".9" height=".9" /></svg>
            Play Tetris
          </button>
        </div>}
    </div>
    <div className={playing ? "gallery-archive gallery-archive--stowed" : "gallery-archive"} aria-hidden={playing || undefined}>
      <TetrisGrid albums={albums} onOpen={open} />
      {albums.length === 0 && <p className="gallery-empty">More team photos are coming soon.</p>}
    </div>
    <AnimatePresence>
      {active && <motion.div
        key="gallery-lightbox"
        className="gallery-lightbox gallery-archive-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`${active.alt} photo viewer`}
        initial={{ backgroundColor: "rgba(3,5,4,0)", backdropFilter: "blur(0px)" }}
        animate={{ backgroundColor: "rgba(3,5,4,.93)", backdropFilter: "blur(18px)" }}
        exit={{ backgroundColor: "rgba(3,5,4,0)", backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.35 }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".gallery-lightbox-close, .gallery-archive-nav"));
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
      >
        <button className="gallery-lightbox-backdrop" type="button" onClick={close} aria-label="Close full-screen photo" />
        <motion.div className="gallery-archive-chrome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button className="gallery-lightbox-close" type="button" onClick={close} autoFocus aria-label="Close full-screen photo"><X size={22}/></button>
          <button className="gallery-archive-nav gallery-archive-prev" type="button" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={24}/></button>
          <button className="gallery-archive-nav gallery-archive-next" type="button" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={24}/></button>
          <p className="gallery-archive-count">{openIndex! + 1} / {photos.length}</p>
        </motion.div>
        <div className="gallery-lightbox-stage">
          <motion.img
            key={active.id}
            layoutId={navigated ? undefined : `gallery-${active.id}`}
            src={active.fullSrc}
            alt={active.alt}
            initial={navigated ? { opacity: 0, scale: 0.96 } : undefined}
            animate={navigated ? { opacity: 1, scale: 1 } : undefined}
            exit={navigated ? { opacity: 0 } : undefined}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        </div>
      </motion.div>}
    </AnimatePresence>
  </LayoutGroup>;
}
