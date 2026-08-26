"use client";

import { useEffect } from "react";

const MAX_TILT = 4;
const DEAD_ZONE = 0.04;
const ACCELERATION_EXPONENT = 1.15;

function shapeAxis(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude <= DEAD_ZONE) return 0;
  const normalized = (magnitude - DEAD_ZONE) / (1 - DEAD_ZONE);
  return Math.sign(value) * normalized ** ACCELERATION_EXPONENT;
}

function bindTiltCard(element: HTMLElement): () => void {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animationFrame = 0;
  let lastFrame = performance.now();
  let isActive = false;

  const render = (now: number) => {
    const deltaTime = Math.min(Math.max((now - lastFrame) / 1000, 0.001), 0.05);
    lastFrame = now;

    const distance = Math.max(Math.abs(targetX - currentX), Math.abs(targetY - currentY));
    const adaptiveRate = 10 + distance * 1.8;
    const alpha = 1 - Math.exp(-deltaTime * adaptiveRate);

    currentX += (targetX - currentX) * alpha;
    currentY += (targetY - currentY) * alpha;

    element.style.transform = `perspective(700px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg) translateY(-3px)`;

    if (isActive || distance > 0.015) {
      animationFrame = requestAnimationFrame(render);
    } else {
      currentX = 0;
      currentY = 0;
      element.style.transform = "";
      element.style.transition = "";
      animationFrame = 0;
    }
  };

  const startAnimation = () => {
    if (animationFrame) return;
    lastFrame = performance.now();
    animationFrame = requestAnimationFrame(render);
  };

  const onEnter = () => {
    isActive = true;
    element.style.transition = "border-color 180ms ease, box-shadow 180ms ease";
    startAnimation();
  };

  const onMove = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;

    targetX = shapeAxis(-y) * MAX_TILT;
    targetY = shapeAxis(x) * MAX_TILT;
    startAnimation();
  };

  const onLeave = () => {
    isActive = false;
    targetX = 0;
    targetY = 0;
    startAnimation();
  };

  element.addEventListener("pointerenter", onEnter);
  element.addEventListener("pointermove", onMove);
  element.addEventListener("pointerleave", onLeave);

  return () => {
    cancelAnimationFrame(animationFrame);
    element.style.transform = "";
    element.style.transition = "";
    element.removeEventListener("pointerenter", onEnter);
    element.removeEventListener("pointermove", onMove);
    element.removeEventListener("pointerleave", onLeave);
  };
}

export function MotionSystem() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduceMotion || !finePointer) return;

    // MotionSystem lives in the persistent root layout and never remounts
    // between pages, so binding tilt listeners with a one-time
    // querySelectorAll only ever finds whichever cards were on the page at
    // that moment. Client-side navigation (and the client-side page cache
    // Next.js uses when you navigate away and back) can swap the actual
    // [data-tilt-card] elements in and out of the DOM at times this
    // component has no direct signal for. A MutationObserver sidesteps that
    // entirely by watching the real DOM and binding/unbinding cards exactly
    // when they appear or disappear, regardless of how or why.
    const bound = new Map<HTMLElement, () => void>();

    const bindWithin = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-tilt-card]") && !bound.has(node as HTMLElement)) {
        bound.set(node as HTMLElement, bindTiltCard(node as HTMLElement));
      }
      node.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((el) => {
        if (!bound.has(el)) bound.set(el, bindTiltCard(el));
      });
    };

    const unbindWithin = (node: Node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("[data-tilt-card]")) {
        bound.get(node as HTMLElement)?.();
        bound.delete(node as HTMLElement);
      }
      node.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((el) => {
        bound.get(el)?.();
        bound.delete(el);
      });
    };

    bindWithin(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(bindWithin);
        mutation.removedNodes.forEach(unbindWithin);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      bound.forEach((cleanup) => cleanup());
      bound.clear();
    };
  }, []);

  return null;
}
