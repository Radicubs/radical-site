"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ThemedImage } from "@/components/ui/themed-image";

// Logo files arrive with very different amounts of empty space around the artwork (some
// are 13% logo, some are cropped to the edge). Measure the visible artwork once it loads,
// crop to it, and size it so every logo has about the same visual weight: wide wordmarks
// get shorter, square marks taller. Sizes are fractions of the strip's logo height.
const WEIGHT = 0.64;
const MAX_HEIGHT = 0.72;
const MAX_WIDTH = 2;

type Box = { x: number; y: number; w: number; h: number; aspect: number };
const measured = new Map<string, Box>();

function inkBox(img: HTMLImageElement): Box {
  const full = { x: 0, y: 0, w: 1, h: 1, aspect: img.naturalWidth / img.naturalHeight || 3 };
  const scale = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = Object.assign(document.createElement("canvas"), { width, height }).getContext("2d", { willReadFrequently: true });
  if (!context) return full;
  context.drawImage(img, 0, 0, width, height);
  let data: Uint8ClampedArray;
  try { data = context.getImageData(0, 0, width, height).data; } catch { return full; } // cross-origin image
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < left) return full;
  const box = { x: left / width, y: top / height, w: (right - left + 1) / width, h: (bottom - top + 1) / height };
  return { ...box, aspect: (box.w * img.naturalWidth) / (box.h * img.naturalHeight) };
}

function markStyle(box: Box): CSSProperties {
  let w = WEIGHT * Math.sqrt(box.aspect);
  let h = WEIGHT / Math.sqrt(box.aspect);
  if (w > MAX_WIDTH) { w = MAX_WIDTH; h = w / box.aspect; }
  if (h > MAX_HEIGHT) { h = MAX_HEIGHT; w = h * box.aspect; }
  return {
    "--mark-w": w, "--mark-h": h,
    "--img-w": `${100 / box.w}%`, "--img-h": `${100 / box.h}%`,
    "--img-x": `${(-100 * box.x) / box.w}%`, "--img-y": `${(-100 * box.y) / box.h}%`
  } as CSSProperties;
}

export function SponsorMark({ src, lightSrc, alt }: { src: string; lightSrc?: string; alt: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<Box | undefined>(() => measured.get(src));

  useEffect(() => {
    if (box) return;
    // With a light-theme variant only one image is displayed (and loaded); measure that one.
    const images = [...(ref.current?.querySelectorAll("img") ?? [])];
    const img = images.find((image) => image.getClientRects().length) ?? images[0];
    if (!img) return;
    const measure = () => {
      const result = measured.get(src) ?? inkBox(img);
      measured.set(src, result);
      setBox(result);
    };
    if (img.complete && img.naturalWidth) measure();
    else img.addEventListener("load", measure, { once: true });
    return () => img.removeEventListener("load", measure);
  }, [box, src]);

  return (
    <span ref={ref} className="sponsor-mark" data-measured={box ? "" : undefined} style={box ? markStyle(box) : undefined}>
      <ThemedImage src={src} lightSrc={lightSrc} alt={alt} title={alt} loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}
