"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./wavy-submit-button.css";

type State = "idle" | "sending" | "done";

const letters = (text: string, from: "start" | "end") =>
  [...text].map((char, i, all) => (
    <span key={i} style={{ "--i": from === "start" ? i : all.length - 1 - i } as CSSProperties}>{char === " " ? " " : char}</span>
  ));

/**
 * Submit button after Aaron Iker's "Wavy Upload Button": the label drops out letter
 * by letter, the top edge ripples while dots bounce, then a check draws in and the
 * done label types on. The form still submits natively; "sending" plays while the
 * request is in flight and `done` comes from the page that the server redirects back to.
 */
export function WavySubmitButton({ label = "Send", doneLabel = "Sent", done = false }: { label?: string; doneLabel?: string; done?: boolean }) {
  const [state, setState] = useState<State>(done ? "done" : "idle");
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    // `submit` only fires once the browser's own validation has passed.
    const onSubmit = () => setState("sending");
    // Coming back via the back button restores the page mid-"sending"; reset it.
    const onShow = (event: PageTransitionEvent) => { if (event.persisted) setState("idle"); };
    form.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onShow);
    return () => { form.removeEventListener("submit", onSubmit); window.removeEventListener("pageshow", onShow); };
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    const timer = window.setTimeout(() => setState("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <button ref={ref} className="wavy-btn" data-state={state} type="submit" aria-busy={state === "sending"} aria-label={state === "sending" ? "Sending…" : state === "done" ? doneLabel : label}>
      <span className="wavy-label" aria-hidden="true">{letters(label, "end")}</span>
      <span className="wavy-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</span>
      <span className="wavy-done" aria-hidden="true">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
        <span className="wavy-done-text">{letters(doneLabel, "start")}</span>
      </span>
    </button>
  );
}
