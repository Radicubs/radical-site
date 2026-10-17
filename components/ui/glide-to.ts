import { lenisRef } from "@/components/ui/lenis-singleton";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Glides to an element, re-reading its position every frame. Sections with
 * `content-visibility: auto` only learn their real height as they render, so a
 * target measured once at click time lands hundreds of pixels off.
 * Any wheel, touch or key input hands control back to the visitor.
 */
export function glideTo(element: HTMLElement, duration = 1400) {
  const lenis = lenisRef.current;
  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const target = () => Math.min(
    element.getBoundingClientRect().top + window.scrollY - margin,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const set = (y: number) => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { set(target()); return; }

  const start = window.scrollY;
  const began = performance.now();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of ["wheel", "touchstart", "keydown"]) window.removeEventListener(type, stop);
  };
  const step = (now: number) => {
    const t = Math.min(1, (now - began) / duration);
    set(start + (target() - start) * easeInOutCubic(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  for (const type of ["wheel", "touchstart", "keydown"]) window.addEventListener(type, stop, { passive: true });
  frame = requestAnimationFrame(step);
}
