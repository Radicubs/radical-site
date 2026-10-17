"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// After moving to another page, images that arrive within this window fade in even when
// they come straight from the cache, so the new page never snaps its photos in.
const AFTER_NAVIGATION_MS = 1500;

/**
 * Any <img> that isn't ready when it reaches the page stays hidden until it has
 * downloaded, then fades in, instead of popping in or painting top to bottom.
 * Images already loaded on first page load show as they are; on later pages, new images
 * fade in even from the cache. Covers lazy and eager images, including ones added later.
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
    const prepare = (img: HTMLImageElement) => {
      if (img.dataset.img) return;
      // `complete` is also true for broken images, which shouldn't be hidden either.
      if (img.complete) {
        img.dataset.img = performance.now() - navigatedAt.current < AFTER_NAVIGATION_MS ? "in" : "ready";
        return;
      }
      img.dataset.img = "loading";
      const show = () => { img.dataset.img = "in"; };
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
