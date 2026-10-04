"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./theme-toggle.css";

type Theme = "light" | "dark";
const STORAGE_KEY = "radicubs-theme";

function SunIcon() {
  return (
    <svg className="tt-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.6" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="12" y1="2.6" x2="12" y2="5" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="tt-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.4 3.6a8.6 8.6 0 1 0 5 13.1A7 7 0 0 1 15.4 3.6Z" />
      <path className="tt-spark" d="M18.2 4.2l.55 1.25 1.25.55-1.25.55-.55 1.25-.55-1.25-1.25-.55 1.25-.55z" />
    </svg>
  );
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

/** Pill switch: a glowing thumb carries the active icon; the new theme is revealed from the toggle outward. */
export function ThemeToggle({ className }: { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setSwitching(true);
    window.setTimeout(() => setSwitching(false), 520);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const commit = () => { applyTheme(next); flushSync(() => setTheme(next)); };

    if (!doc.startViewTransition || reduceMotion || !ref.current) { commit(); return; }

    // Reveal the new theme as a rounded rectangle growing out of the toggle.
    const box = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const from = `inset(${box.top}px ${vw - box.right}px ${vh - box.bottom}px ${box.left}px round ${box.height / 2}px)`;
    const transition = doc.startViewTransition(commit);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [from, "inset(0px 0px 0px 0px round 0px)"] },
        { duration: 700, easing: "cubic-bezier(.7, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };

  const isLight = theme === "light";
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      className={["tt", switching && "tt--switching", className].filter(Boolean).join(" ")}
      onClick={toggle}
    >
      <span className="tt-slot tt-slot--sun"><SunIcon /></span>
      <span className="tt-slot tt-slot--moon"><MoonIcon /></span>
      <span className="tt-thumb" aria-hidden="true">
        <span className="tt-thumb-icon tt-thumb-icon--sun"><SunIcon /></span>
        <span className="tt-thumb-icon tt-thumb-icon--moon"><MoonIcon /></span>
      </span>
    </button>
  );
}
