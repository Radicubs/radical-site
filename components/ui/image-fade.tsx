"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// After moving to another page, images that arrive within this window fade in even when
// they come straight from the cache, so the new page never snaps its photos in.
const AFTER_NAVIGATION_MS = 1500;
const FADE = { duration: 450, easing: "ease-out" };

/**
 * Any <img> that isn't ready when it reaches the page stays hidden until it has
 * downloaded, then fades in, instead of popping in or painting top to bottom.
 * Images already loaded on first page load show as they are; on later pages, new images
 * fade in even from the cache. Covers lazy and eager images, including ones added later.
 *
 * Works through the Web Animations API rather than attributes or classes: sections that
 * stream in hydrate after this runs, and React reports any attribute it didn't render.
 */
export function ImageFade() {
  const pathname = usePathname();
  const navigatedAt = useRef(-Infinity);
  const firstPath = useRef(pathname);
  // Mark the moment of each client-side navigation (not the first page load).
  if (pathname !== firstPath.current && typeof performance !== "undefined") {
    firstPath.current = pathname;
    navigatedAt.current = performance.now();
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<HTMLImageElement>();
    // One keyframe pinned at the start: fades from 0 to whatever opacity the image's own
    // styles give it. (Without offset 0, a lone keyframe is treated as the end state.)
    const fadeIn = (img: HTMLImageElement) => img.animate([{ opacity: 0, offset: 0 }], FADE);
    const prepare = (img: HTMLImageElement) => {
      if (seen.has(img)) return;
      seen.add(img);
      // `complete` is also true for broken images, which shouldn't be hidden either.
      if (img.complete) {
        if (performance.now() - navigatedAt.current < AFTER_NAVIGATION_MS) fadeIn(img);
        return;
      }
      // Hold the image invisible until it has loaded.
      const hold = img.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1e9 });
      const show = () => { hold.cancel(); fadeIn(img); };
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
    };
    const scan = (node: Node) => {
      if (node instanceof HTMLImageElement) prepare(node);
      else if (node instanceof Element) node.querySelectorAll("img").forEach(prepare);
    };
    scan(document.body);
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(scan)));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
