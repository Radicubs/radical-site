"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./donate-link.css";

type State = "idle" | "thanks";

/**
 * Donate link that says thanks when pressed: the button squashes, the word's letters
 * drop out, and a heart pops in and beats before the word comes back. Donating opens
 * in a new tab, so the heart waits until the visitor returns before beating again.
 */
export function DonateLink({ href, className, children = "Donate", after }: { href: string; className?: string; children?: ReactNode; after?: ReactNode }) {
  const [state, setState] = useState<State>("idle");
  const [beat, setBeat] = useState(0);
  const timer = useRef(0);

  useEffect(() => {
    if (state !== "thanks") return;
    const settle = (ms: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setState("idle"), ms); };
    const onVisibility = () => {
      if (document.hidden) { window.clearTimeout(timer.current); return; }
      setBeat((b) => b + 1);
      settle(1600);
    };
    settle(2200);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { window.clearTimeout(timer.current); document.removeEventListener("visibilitychange", onVisibility); };
  }, [state]);

  const word = typeof children === "string"
    ? [...children].map((char, i) => <span key={i} className="donate-char" style={{ "--i": i } as CSSProperties}>{char}</span>)
    : children;

  return (
    <a
      className={["donate-link", className].filter(Boolean).join(" ")}
      data-donate={state}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => setState("thanks")}
    >
      <span className="donate-anim">
        <span className="donate-word">{word}</span>
        <svg key={beat} className="donate-heart" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.2C19.5 16.4 12 21 12 21Z" />
        </svg>
      </span>
      {after}
    </a>
  );
}
