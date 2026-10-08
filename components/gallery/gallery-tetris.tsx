"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronsDown, RotateCw } from "lucide-react";
import type { GalleryPhoto } from "@/lib/cms";
import "./gallery-tetris.css";

const BEST_KEY = "radicubs-tetris-best";
const LINE_SCORES = [0, 100, 300, 500, 800];
// Cumulative score targets: 100, 300, 600, 1,000, ...
const scoreForNextLevel = (level: number) => 100 * level * (level + 1) / 2;
const LEVEL_UP_DURATION = 1600;
// Big tiles over a big board: few rows (still one screen tall), so each photo reads clearly.
const ROWS_DESKTOP = 9;
const ROWS_MOBILE = 11;
const FALLBACK_PHOTO = "/radicubs-2026-hero.webp";

// A resized CMS image can be unavailable even when another copy still works.
function loadPieceImage(candidates: string[]) {
  const img = new Image();
  img.decoding = "async";
  const urls = [...new Set([...candidates, FALLBACK_PHOTO])];
  let index = 0;
  img.onerror = () => {
    if (++index < urls.length) img.src = urls[index];
  };
  img.src = urls[index];
  return img;
}

const SHAPES = {
  I: ["....", "XXXX", "....", "...."],
  O: ["XX", "XX"],
  T: [".X.", "XXX", "..."],
  S: [".XX", "XX.", "..."],
  Z: ["XX.", ".XX", "..."],
  J: ["X..", "XXX", "..."],
  L: ["..X", "XXX", "..."]
} as const;
type Kind = keyof typeof SHAPES;
const KINDS = Object.keys(SHAPES) as Kind[];

// A piece carries one photo, cropped to the piece's bounding box and turned with the piece.
// Locked cells remember that box (in board cells) so the picture stays whole after landing.
type Block = { x: number; y: number };
type Piece = { id: number; kind: Kind; n: number; blocks: Block[]; x: number; y: number; rot: number; img: HTMLImageElement };
type Cell = { id: number; img: HTMLImageElement; x0: number; y0: number; w: number; h: number; rot: number };
type Status = "playing" | "paused" | "over";
type Box = { x: number; y: number; w: number; h: number };
type Joins = { up: boolean; down: boolean; left: boolean; right: boolean; diag: boolean };

const rotate = (blocks: Block[], n: number, dir: 1 | -1) =>
  blocks.map((b) => (dir === 1 ? { x: n - 1 - b.y, y: b.x } : { x: b.y, y: n - 1 - b.x }));
// Reach new levels quickly without making the shallow gallery board unforgiving.
const speedFor = (level: number) => Math.max(300, 1100 - (level - 1) * 65);
const bounds = (blocks: Block[]) => {
  const xs = blocks.map((b) => b.x), ys = blocks.map((b) => b.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  return { minX, minY, w: Math.max(...xs) - minX + 1, h: Math.max(...ys) - minY + 1 };
};

/**
 * One block of a piece. Its clip joins across the gutter to neighbouring blocks of the
 * same piece (square corners on joined sides), and the piece's photo is drawn into the
 * whole piece box, so the blocks read as one picture cut into a Tetris shape.
 */
function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number, gap: number, radius: number, joins: Joins, img: HTMLImageElement, box: Box, rot: number) {
  const { up, down, left, right, diag } = joins;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, tile, tile, [up || left ? 0 : radius, up || right ? 0 : radius, down || right ? 0 : radius, down || left ? 0 : radius]);
  if (right) ctx.rect(x + tile - 1, y, gap + 2, tile);
  if (down) ctx.rect(x, y + tile - 1, tile, gap + 2);
  if (right && down && diag) ctx.rect(x + tile - 1, y + tile - 1, gap + 2, gap + 2);
  ctx.clip();
  if (img.complete && img.naturalWidth) {
    // Cover-crop the photo to the piece's unrotated shape, then turn it with the piece.
    const turned = rot % 2 === 1;
    const W = turned ? box.h : box.w, H = turned ? box.w : box.h;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const sw = W / scale, sh = H / scale;
    ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
    ctx.rotate((rot * Math.PI) / 2);
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, -W / 2, -H / 2, W, H);
  } else {
    ctx.fillStyle = "#1b1d1e";
    ctx.fillRect(x, y, tile + gap, tile + gap);
  }
  ctx.restore();
}

// Draws a piece given its block cells (absolute), using `at` to map cells to pixels.
function drawPiece(ctx: CanvasRenderingContext2D, cells: Block[], at: (c: number) => number, cell: number, gap: number, radius: number, img: HTMLImageElement, rot: number) {
  const has = (x: number, y: number) => cells.some((b) => b.x === x && b.y === y);
  const { minX, minY, w, h } = bounds(cells);
  const box = { x: at(minX), y: at(minY), w: w * cell - gap, h: h * cell - gap };
  for (const b of cells) {
    const joins = { up: has(b.x, b.y - 1), down: has(b.x, b.y + 1), left: has(b.x - 1, b.y), right: has(b.x + 1, b.y), diag: has(b.x + 1, b.y + 1) };
    drawBlock(ctx, at(b.x), at(b.y), cell - gap, gap, radius, joins, img, box, rot);
  }
}

// A compact pixel alphabet keeps the arcade lettering sharp at any board size.
const ARCADE_GLYPHS: Record<string, string[]> = {
  L: ["11000", "11000", "11000", "11000", "11000", "11111", "11111"],
  E: ["11111", "11111", "11000", "11110", "11000", "11111", "11111"],
  V: ["110011", "110011", "110011", "110011", "011110", "001100", "001100"],
  U: ["11011", "11011", "11011", "11011", "11011", "11111", "01110"],
  P: ["11110", "11111", "11011", "11111", "11110", "11000", "11000"]
};

function ArcadeLevelUp() {
  const pathFor = (word: string) => {
    let offset = 0;
    return [...word].map((letter) => {
      const glyph = ARCADE_GLYPHS[letter];
      const path = glyph.flatMap((row, y) => [...row].flatMap((pixel, x) =>
        pixel === "1" ? [`M${offset + x} ${y}h1v1h-1z`] : []
      )).join("");
      offset += glyph[0].length + 1;
      return path;
    }).join("");
  };
  return (
    <svg className="gt-arcade-text" viewBox="-1 -1 33 19" aria-hidden="true">
      {[{ word: "LEVEL", x: 0, y: 0 }, { word: "UP", x: 9.5, y: 9 }].map(({ word, x, y }) => (
        <g key={word} className={`gt-arcade-word gt-arcade-word--${word.toLowerCase()}`} transform={`translate(${x} ${y})`}>
          <path d={pathFor(word)} fill="#00632a" transform="translate(0 .8)" />
          <path d={pathFor(word)} fill="#00f5bc" transform="translate(0 .45)" />
          <path d={pathFor(word)} fill="#59ff00" />
        </g>
      ))}
    </svg>
  );
}

export function GalleryTetris({ photos, onClose }: { photos: GalleryPhoto[]; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const visible = useRef(true);
  // Photos are fetched as pieces first use them, not all at once on open.
  const sources = useRef<string[][]>([]);
  const images = useRef<(HTMLImageElement | undefined)[]>([]);
  const fallbackImage = useRef<HTMLImageElement | null>(null);
  // Board dimensions are fixed for a game; only the pixel size follows the section width.
  const dims = useRef({ cols: 0, rows: 0 });
  const [size, setSize] = useState({ cell: 0, gap: 0 });
  const [hud, setHud] = useState({ score: 0, lines: 0, level: 1 });
  const [status, setStatus] = useState<Status>("playing");
  const [best, setBest] = useState(0);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const pieceId = useRef(0);
  const game = useRef({ board: [] as (Cell | null)[][], piece: null as Piece | null, next: null as Piece | null, bag: [] as Kind[], score: 0, lines: 0, level: 1, celebration: 0, acc: 0, status: "playing" as Status });

  if (!sources.current.length) {
    const pool = [...photos].sort(() => Math.random() - 0.5).slice(0, 40);
    sources.current = pool.length
      ? pool.map((photo) => [photo.src, photo.thumbSrc, photo.fullSrc])
      : [[FALLBACK_PHOTO]];
  }

  useEffect(() => {
    fallbackImage.current = loadPieceImage([FALLBACK_PHOTO]);
  }, []);

  // Keep a photo on the board while a newly chosen image is downloading.
  const readyImage = (img: HTMLImageElement) => {
    if (img.complete && img.naturalWidth) return img;
    return images.current.find((candidate) => candidate?.complete && candidate.naturalWidth)
      ?? fallbackImage.current ?? img;
  };

  const pickImage = () => {
    const index = Math.floor(Math.random() * sources.current.length);
    let img = images.current[index];
    if (!img) {
      img = loadPieceImage(sources.current[index]);
      images.current[index] = img;
    }
    return img;
  };

  const emptyBoard = () => Array.from({ length: dims.current.rows }, () => new Array<Cell | null>(dims.current.cols).fill(null));

  function collides(blocks: Block[], x: number, y: number) {
    const { board } = game.current;
    const { cols, rows } = dims.current;
    return blocks.some((b) => {
      const cx = x + b.x, cy = y + b.y;
      return cx < 0 || cx >= cols || cy >= rows || (cy >= 0 && board[cy][cx] !== null);
    });
  }

  const draw = useCallback(() => {
    const canvas = boardRef.current;
    const ctx = canvas?.getContext("2d");
    const { cols, rows } = dims.current;
    if (!canvas || !ctx || !size.cell || !cols) return;
    const { cell, gap } = size;
    const dpr = window.devicePixelRatio || 1;
    const light = document.documentElement.dataset.theme === "light";
    const tile = cell - gap, radius = Math.min(8, tile * 0.16);
    const at = (c: number) => c * cell + gap / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cols * cell, rows * cell);
    const g = game.current;
    // Empty slots: the faint grid the photos used to sit in.
    ctx.fillStyle = light ? "rgba(18,26,17,.05)" : "rgba(255,255,255,.035)";
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (g.board[y]?.[x]) continue;
      ctx.beginPath(); ctx.roundRect(at(x), at(y), tile, tile, radius); ctx.fill();
    }
    // Locked blocks join to neighbours from the same piece that haven't been split by a cleared line.
    const same = (c: Cell, x: number, y: number) => { const o = g.board[y]?.[x]; return !!o && o.id === c.id && o.y0 === c.y0; };
    g.board.forEach((row, y) => row.forEach((c, x) => {
      if (!c) return;
      const joins = { up: same(c, x, y - 1), down: same(c, x, y + 1), left: same(c, x - 1, y), right: same(c, x + 1, y), diag: same(c, x + 1, y + 1) };
      drawBlock(ctx, at(x), at(y), tile, gap, radius, joins, readyImage(c.img), { x: at(c.x0), y: at(c.y0), w: c.w * cell - gap, h: c.h * cell - gap }, c.rot);
    }));
    const p = g.piece;
    if (!p) return;
    let ghost = 0;
    while (!collides(p.blocks, p.x, p.y + ghost + 1)) ghost++;
    ctx.strokeStyle = light ? "rgba(31,127,13,.7)" : "rgba(102,255,85,.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    for (const b of p.blocks) if (p.y + b.y + ghost >= 0) { ctx.beginPath(); ctx.roundRect(at(p.x + b.x) + 1, at(p.y + b.y + ghost) + 1, tile - 2, tile - 2, radius); ctx.stroke(); }
    ctx.setLineDash([]);
    drawPiece(ctx, p.blocks.map((b) => ({ x: p.x + b.x, y: p.y + b.y })), at, cell, gap, radius, readyImage(p.img), p.rot);
  }, [size]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawNext = useCallback(() => {
    const canvas = nextRef.current;
    const ctx = canvas?.getContext("2d");
    const p = game.current.next;
    if (!canvas || !ctx || !p) return;
    const s = 12, dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 4 * s, 2 * s);
    const { minX, minY, w, h } = bounds(p.blocks);
    const ox = (4 - w) / 2 - minX, oy = (2 - h) / 2 - minY;
    drawPiece(ctx, p.blocks.map((b) => ({ x: b.x + ox, y: b.y + oy })), (c) => c * s + 1, s, 2, 2, readyImage(p.img), p.rot);
  }, []);

  const randomPiece = useCallback((): Piece => {
    const g = game.current;
    if (!g.bag.length) g.bag = [...KINDS].sort(() => Math.random() - 0.5);
    const kind = g.bag.pop()!;
    const rows = SHAPES[kind];
    return {
      kind,
      n: rows.length,
      id: ++pieceId.current,
      rot: 0,
      blocks: rows.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === "X" ? [{ x, y }] : []))),
      x: Math.floor((dims.current.cols - rows.length) / 2),
      y: kind === "I" ? -1 : 0,
      img: pickImage()
    };
  }, []);

  const setGameStatus = useCallback((next: Status) => { game.current.status = next; setStatus(next); }, []);

  const endGame = useCallback(() => {
    const { score } = game.current;
    setGameStatus("over");
    setBest((prev) => {
      if (score <= prev) return prev;
      try { localStorage.setItem(BEST_KEY, String(score)); } catch {}
      return score;
    });
  }, [setGameStatus]);

  const spawn = useCallback(() => {
    const g = game.current;
    g.piece = g.next ?? randomPiece();
    g.next = randomPiece();
    drawNext();
    if (collides(g.piece.blocks, g.piece.x, g.piece.y)) endGame();
  }, [drawNext, endGame, randomPiece]); // eslint-disable-line react-hooks/exhaustive-deps

  const lock = useCallback(() => {
    const g = game.current;
    const p = g.piece!;
    const { cols, rows } = dims.current;
    const { minX, minY, w, h } = bounds(p.blocks);
    for (const b of p.blocks) {
      const y = p.y + b.y;
      if (y < 0) { endGame(); return; }
      g.board[y][p.x + b.x] = { id: p.id, img: p.img, x0: p.x + minX, y0: p.y + minY, w, h, rot: p.rot };
    }
    const full = g.board.map((row) => row.every((c) => c !== null));
    const cleared = full.filter(Boolean).length;
    if (cleared) {
      // Each surviving row drops by the number of cleared rows beneath it; its cells'
      // photo boxes move with it, so pieces cut by a clear keep their part of the picture.
      const kept: (Cell | null)[][] = [];
      let below = 0;
      for (let y = rows - 1; y >= 0; y--) {
        if (full[y]) { below++; continue; }
        kept.unshift(g.board[y].map((c) => (c && below ? { ...c, y0: c.y0 + below } : c)));
      }
      g.board = [...Array.from({ length: cleared }, () => new Array<Cell | null>(cols).fill(null)), ...kept];
      g.lines += cleared;
      g.score += LINE_SCORES[Math.min(cleared, 4)] * g.level;
    }
    // All earned points count, including instant drops. Honour large score jumps.
    const previousLevel = g.level;
    while (g.score >= scoreForNextLevel(g.level)) g.level++;
    if (g.level > previousLevel) {
      g.board = emptyBoard();
      g.celebration = LEVEL_UP_DURATION;
      setLevelUp(g.level);
    }
    // Give each newly spawned piece its full fall interval, including after a hard drop.
    g.acc = 0;
    setHud({ score: g.score, lines: g.lines, level: g.level });
    spawn();
  }, [endGame, spawn]);

  const move = useCallback((dx: number, dy: number) => {
    const g = game.current;
    const p = g.piece;
    if (!p || g.status !== "playing" || g.celebration > 0) return false;
    if (collides(p.blocks, p.x + dx, p.y + dy)) {
      if (dy > 0) lock();
      return false;
    }
    p.x += dx;
    p.y += dy;
    return true;
  }, [lock]); // eslint-disable-line react-hooks/exhaustive-deps

  const turn = useCallback((dir: 1 | -1) => {
    const g = game.current;
    const p = g.piece;
    if (!p || g.status !== "playing" || g.celebration > 0) return;
    const blocks = rotate(p.blocks, p.n, dir);
    // Simple wall kicks: nudge sideways (and up for the I piece) until it fits.
    for (const [kx, ky] of [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]]) {
      if (!collides(blocks, p.x + kx, p.y + ky)) { p.blocks = blocks; p.x += kx; p.y += ky; p.rot = (p.rot + dir + 4) % 4; return; }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hardDrop = useCallback(() => {
    const g = game.current;
    const p = g.piece;
    if (!p || g.status !== "playing" || g.celebration > 0) return;
    let dropped = 0;
    while (!collides(p.blocks, p.x, p.y + 1)) { p.y++; dropped++; }
    g.score += dropped * 2;
    lock();
  }, [lock]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = useCallback(() => {
    const g = game.current;
    // Negative accumulator = a short grace period before the first piece starts falling.
    Object.assign(g, { board: emptyBoard(), piece: null, next: null, bag: [], score: 0, lines: 0, level: 1, celebration: 0, acc: -900 });
    setHud({ score: 0, lines: 0, level: 1 });
    setLevelUp(null);
    setGameStatus("playing");
    spawn();
  }, [spawn, setGameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePause = useCallback(() => {
    const g = game.current;
    if (g.status !== "over") setGameStatus(g.status === "paused" ? "playing" : "paused");
  }, [setGameStatus]);

  // The board spans the whole gallery section. Rows are picked so it fits one screen
  // under the navbar; columns fill the section width at that cell size.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const width = root.clientWidth;
      if (!dims.current.cols) {
        const mobile = width < 640;
        const available = window.innerHeight - (mobile ? 330 : 200);
        const rows = mobile ? ROWS_MOBILE : ROWS_DESKTOP;
        const cell = Math.max(36, Math.min(available / rows, width / 7));
        dims.current = { cols: Math.max(7, Math.ceil(width / cell)), rows };
      }
      const cell = width / dims.current.cols;
      // Gap in proportion to the tile, like the photo grid's gutters.
      setSize({ cell, gap: Math.max(3, Math.round(cell * 0.12)) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = boardRef.current;
    if (!canvas || !size.cell) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(dims.current.cols * size.cell * dpr);
    canvas.height = Math.round(dims.current.rows * size.cell * dpr);
    draw();
  }, [size, draw]);

  useEffect(() => {
    if (!size.cell || game.current.board.length) return;
    const next = nextRef.current;
    if (next) { const dpr = window.devicePixelRatio || 1; next.width = 48 * dpr; next.height = 24 * dpr; }
    try { setBest(Number(localStorage.getItem(BEST_KEY)) || 0); } catch {}
    rootRef.current?.focus({ preventScroll: true });
    restart();
  }, [size.cell, restart]);

  // Game loop.
  useEffect(() => {
    let frame = 0, last = performance.now();
    const tick = (now: number) => {
      const g = game.current;
      const dt = Math.min(now - last, 100);
      last = now;
      if (g.status === "playing" && g.piece) {
        if (g.celebration > 0) {
          g.celebration = Math.max(0, g.celebration - dt);
          if (g.celebration === 0) setLevelUp(null);
        } else {
          g.acc += dt;
          const interval = speedFor(g.level);
          while (g.acc >= interval && g.status === "playing" && !g.celebration) {
            g.acc -= interval;
            move(0, 1);
          }
        }
      }
      draw();
      drawNext();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw, drawNext, move]);

  // Pause when the board is scrolled out of view; keys only drive the game while it's on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (!entry.isIntersecting && game.current.status === "playing") setGameStatus("paused");
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [setGameStatus]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key;
      if (!visible.current || event.metaKey || event.ctrlKey || event.altKey) return;
      if (key === "Escape") { onClose(); return; }
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(key)) event.preventDefault();
      if (key === "p" || key === "P") togglePause();
      else if (key === "ArrowLeft") move(-1, 0);
      else if (key === "ArrowRight") move(1, 0);
      else if (key === "ArrowDown") { if (!event.repeat) hardDrop(); }
      else if (key === "ArrowUp" || key === "x" || key === "X") turn(1);
      else if (key === "z" || key === "Z") turn(-1);
      else if (key === " " && !event.repeat) { if (game.current.status === "over") restart(); else hardDrop(); }
    };
    window.addEventListener("keydown", down);
    return () => {
      window.removeEventListener("keydown", down);
    };
  }, [hardDrop, move, onClose, restart, togglePause, turn]);

  const boardW = dims.current.cols * size.cell, boardH = dims.current.rows * size.cell;

  return (
    <>
      <div className="gallery-toolbar gt-toolbar">
        <dl className="gt-stats">
          <div><dt>Score</dt><dd>{hud.score.toLocaleString()}</dd></div>
          <div><dt>Lines</dt><dd>{hud.lines}</dd></div>
          <div><dt>Level</dt><dd>{hud.level}</dd></div>
          <div><dt>Next level</dt><dd>{scoreForNextLevel(hud.level).toLocaleString()} pts</dd></div>
          <div><dt>Best</dt><dd>{Math.max(best, hud.score).toLocaleString()}</dd></div>
          <div className="gt-next-wrap"><dt>Next</dt><dd><canvas ref={nextRef} style={{ width: 48, height: 24 }} aria-hidden="true" /></dd></div>
        </dl>
        <div className="gt-actions">
          <button className="gallery-play gallery-play--quiet" type="button" onClick={togglePause} disabled={status === "over"}>{status === "paused" ? "Resume" : "Pause"}</button>
          <button className="gallery-play" type="button" onClick={onClose}>
            <svg viewBox="0 0 3 2" aria-hidden="true"><rect x="0" y="0" width=".9" height=".9" /><rect x="1" y="0" width=".9" height=".9" /><rect x="2" y="0" width=".9" height=".9" /><rect x="1" y="1" width=".9" height=".9" /></svg>
            Back to gallery
          </button>
        </div>
      </div>
      <div className="gt" ref={rootRef} role="region" aria-label="Gallery Tetris" tabIndex={-1}>
        <div className="gt-board" style={{ height: boardH || undefined }}>
          <canvas ref={boardRef} style={{ width: boardW, height: boardH }} aria-label="Tetris board" role="img" />
          <div className="gt-announcement" role="status" aria-live="polite" aria-atomic="true">
            {levelUp !== null ? `Level ${levelUp}! Board cleared.` : ""}
          </div>
          {levelUp !== null && status === "playing" && (
            <div className="gt-level-up" key={levelUp} aria-hidden="true">
              <div className="gt-level-title">
                <ArcadeLevelUp />
                <small>Level {String(levelUp).padStart(2, "0")} · Board cleared</small>
              </div>
            </div>
          )}
          {status !== "playing" && (
            <div className="gt-overlay">
              <p className="gt-kicker">{status === "over" ? "Game over" : "Paused"}</p>
              {status === "over" && <p className="gt-final">{hud.score.toLocaleString()}</p>}
              <button className="gt-btn" type="button" onClick={status === "over" ? restart : togglePause}>
                {status === "over" ? "Play again" : "Resume"}
              </button>
            </div>
          )}
        </div>
        <p className="gt-progress-hint">{(scoreForNextLevel(hud.level) - hud.score).toLocaleString()} more points to level {hud.level + 1} · Drops and cleared lines both count</p>
        <p className="gt-keys">← → move · ↑ rotate · ↓ / space instant drop · P pause · esc exit</p>
        <div className="gt-touch" aria-label="Game controls">
          <button type="button" onClick={() => move(-1, 0)} aria-label="Move left"><ArrowLeft size={22} /></button>
          <button type="button" onClick={() => turn(1)} aria-label="Rotate"><RotateCw size={22} /></button>
          <button type="button" onClick={() => move(1, 0)} aria-label="Move right"><ArrowRight size={22} /></button>
          <button type="button" onClick={hardDrop} aria-label="Instant drop"><ChevronsDown size={22} /></button>
        </div>
      </div>
    </>
  );
}
