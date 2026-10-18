"use client";

import { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import "./DriftWall.css";

export interface DriftWallItem {
  image: string;
  previewImage?: string;
  /** Full responsive candidate list; wins over previewImage when present. */
  srcSet?: string;
  title?: string;
  href?: string;
}

export interface DriftWallProps {
  items?: DriftWallItem[];
  onItemClick?: (item: DriftWallItem, index: number) => void;
  decorative?: boolean;
  /** Fill wide heroes while preserving tile proportions and curvature. */
  responsive?: boolean;
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  /** Uniform scale of the whole wall plane. */
  scale?: number;
  /** Radius (px) of the cylinder the columns wrap around; 0 keeps the wall flat. */
  curve?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
  style?: CSSProperties;
}

interface ColumnMeta {
  copyHeight: number;
  copies: number;
}

const DEFAULT_ITEMS: DriftWallItem[] = Array.from({ length: 15 }, (_, i) => {
  const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164];
  return {
    image: `https://picsum.photos/id/${ids[i % ids.length]}/600/400`,
    title: `Tile ${i + 1}`,
    href: undefined
  };
});

// Windows turns this on whenever "Animation effects" is off, which many laptops ship with, so
// a frozen wall would look broken there. Reduced motion drifts at this fraction of the speed instead.
const REDUCED_SPEED = 0.35;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

const DriftWall = ({
  items = DEFAULT_ITEMS,
  onItemClick,
  decorative = false,
  responsive = false,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  scale = 1.18,
  curve = 0,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
  style
}: DriftWallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef<number>(-1);
  const wallHoveredRef = useRef<boolean>(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);

  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(1280);
  const [viewport, setViewport] = useState({ width: 1280, height: 720 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [reduced, setReduced] = useState(false);

  // Grow tiles with the screen, then add symmetric columns on wide/short displays.
  // Scale every 3D length together so perspective keeps the same proportions.
  // Past the 1470x820 reference laptop, lay the wall out at laptop scale and enlarge it with the
  // site's --u (width ratio, capped by height ratio). Wide-short screens then gain columns
  // instead of oversized tiles, and the wall still runs edge to edge.
  const enlarge = responsive ? Math.max(1, Math.min(viewport.width / 1470, viewport.height / 820)) : 1;
  const fit = responsive ? enlarge * Math.max(1, Math.min(containerWidth / enlarge / 1280, containerHeight / enlarge / 720)) : 1;
  const extraColumns = responsive ? Math.max(0, Math.ceil((columns * (containerWidth / (1280 * fit) - 1)) / 2) * 2) : 0;
  const columnCount = columns + extraColumns;
  const fittedTileWidth = tileWidth * fit;
  const fittedTileHeight = tileHeight * fit;
  const fittedGap = gap * fit;
  const fittedCurve = curve * fit * (columnCount / columns);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const columnItems = useMemo<DriftWallItem[][]>(() => {
    const cols: DriftWallItem[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, i) => cols[i % columnCount].push(item));
    return cols.map(col => (col.length ? col : items.slice(0, 1)));
  }, [items, columnCount]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = fittedTileHeight + fittedGap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, fittedTileHeight, fittedGap, containerHeight]);

  // Curved layout: `curve` is the radius (px) of a cylinder wrapping around the viewer. Columns sit
  // at equal arc spacing, the edges come forward and each column turns to face the axis, so gaps stay
  // proportional to their tiles while the wall visibly bends toward the center.
  const columnTransforms = useMemo<(string | undefined)[]>(() => {
    if (!fittedCurve) return Array.from({ length: columnCount }, () => undefined);
    const mid = (columnCount - 1) / 2;
    const colW = fittedTileWidth + fittedGap;
    return Array.from({ length: columnCount }, (_, c) => {
      const phi = ((c - mid) * colW) / fittedCurve;
      const shift = fittedCurve * Math.sin(phi) - (c - mid) * colW;
      const z = fittedCurve * (1 - Math.cos(phi));
      return `translateX(${shift.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateY(${((-phi * 180) / Math.PI).toFixed(2)}deg)`;
    });
  }, [fittedCurve, columnCount, fittedTileWidth, fittedGap]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600);
      setContainerWidth(entry.contentRect.width || 1280);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo<number[]>(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * fit * columnFactor(c, variance) * dirSign * altSign;
    });
  }, [columnItems, speed, direction, variance, fit]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) scale(${scale}) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth * fit}px)`;
    },
    [tilt, turn, roll, depth, scale, fit]
  );

  useEffect(() => {
    let visible = true;
    const shouldAnimate = () => visible && !document.hidden;
    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const maxTilt = parallax * 8;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      for (let c = 0; c < trackRefs.current.length; c++) {
        const meta = columnMeta[c];
        if (!meta) continue;
        const paused = wallHoveredRef.current && pauseOnHover;
        const factor = paused || hoveredColRef.current === c ? 0 : reduced ? REDUCED_SPEED : 1;
        const target = baseVelocities[c] * factor;

        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;
        let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsetsRef.current[c] = next;

        const el = trackRefs.current[c];
        if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
      }

      rafRef.current = shouldAnimate() ? requestAnimationFrame(animate) : null;
    };

    // Stop the animation loop once the wall scrolls away or the browser tab is hidden.
    applyPlaneTransform(0, 0);
    for (let c = 0; c < trackRefs.current.length; c++) {
      const track = trackRefs.current[c];
      if (track) track.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
    }
    const syncAnimation = () => {
      if (shouldAnimate()) {
        if (rafRef.current === null) {
          lastTsRef.current = null;
          rafRef.current = requestAnimationFrame(animate);
        }
      } else {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = null;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    document.addEventListener('visibilitychange', syncAnimation);
    syncAnimation();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform]);

  const activate = useCallback((id: string, index: number): void => {
    activeIdRef.current = id;
    hoveredColRef.current = index;
    setActiveId(id);
  }, []);
  const release = useCallback((): void => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5
        };
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit && hit.closest ? (hit.closest('[data-tile-id]') as HTMLElement | null) : null;
      if (!tile) return;
      const id = tile.dataset.tileId ?? null;
      if (id === activeIdRef.current) return;
      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced]
  );

  const handlePointerLeaveWall = useCallback((): void => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const cssVars = useMemo<CSSProperties>(
    () =>
      ({
        '--dw-tile-w': `${fittedTileWidth}px`,
        '--dw-tile-h': `${fittedTileHeight}px`,
        '--dw-gap': `${fittedGap}px`,
        '--dw-radius': `${radius * fit}px`,
        '--dw-perspective': `${perspective * fit}px`,
        '--dw-lift': `${lift * fit}px`,
        '--dw-dim': dim,
        '--dw-gray': grayscale ? 1 : 0,
        '--dw-overlay': overlayColor,
        '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
        ...style
      }) as CSSProperties,
    [fittedTileWidth, fittedTileHeight, fittedGap, fit, radius, perspective, lift, dim, grayscale, overlayColor, fade, style]
  );

  const renderTile = (item: DriftWallItem, id: string, colIndex: number) => {
    const inner = (
      <span className="drift-wall__inner">
        <img
          src={item.previewImage ?? item.image}
          srcSet={item.srcSet ?? (item.previewImage ? `${item.previewImage} 245w, ${item.image} 750w` : undefined)}
          sizes={`${Math.ceil(fittedTileWidth * scale)}px`}
          alt={item.title ?? ''}
          // Lazy even when decorative: only tiles near the screen download, and long walls
          // fill in as their columns drift into view.
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    );
    const commonProps = {
      className: `drift-wall__tile${activeId === id ? ' is-active' : ''}`,
      'data-tile-id': id,
      'data-col': colIndex,
      onFocus: decorative ? undefined : () => activate(id, colIndex),
      onBlur: decorative ? undefined : release,
      ...(onItemClick && !item.href
        ? { onClick: () => onItemClick(item, items.indexOf(item)) }
        : {})
    };
    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }
    return (
      <div key={id} tabIndex={decorative ? undefined : 0} role={decorative ? undefined : "button"} aria-label={decorative ? undefined : item.title ?? 'tile'} {...commonProps}>
        {inner}
      </div>
    );
  };

  const rootClass = ['drift-wall', reduced ? 'drift-wall--reduced' : '', activeId ? 'drift-wall--focus' : '', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClass}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role={decorative ? undefined : "group"}
      aria-label={decorative ? undefined : "Drifting wall of tiles"}
      aria-hidden={decorative ? true : undefined}
    >
      {/* Anchor tracks to the viewport, rather than the tallest repeated column.
          This keeps shorter columns filled even when animation is frozen. */}
      <div ref={planeRef} className="drift-wall__plane" style={responsive ? { height: "100%" } : undefined}>
        {columnItems.map((col, c) => {
          const meta = columnMeta[c];
          const copies = Array.from({ length: meta.copies });
          return (
            <div
              className="drift-wall__col"
              key={`col-${c}`}
              style={columnTransforms[c] ? { transform: columnTransforms[c] } : undefined}
            >
              <div
                className="drift-wall__track"
                ref={el => {
                  trackRefs.current[c] = el;
                }}
              >
                {copies.map((_, copyIndex) =>
                  col.map((item, itemIndex) => renderTile(item, `${c}-${copyIndex}-${itemIndex}`, c))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
