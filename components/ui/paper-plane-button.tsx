"use client";

import { useEffect, useRef, useState } from "react";
import "./paper-plane-button.css";

type State = "idle" | "sending" | "done";

// How long the fold-and-fly plays before the form actually leaves the page.
const FLIGHT_MS = 1100;

/**
 * Submit button after Aaron Iker's "Paper plane button v2" (dribbble.com/ai): the
 * button folds into a paper plane, winds back, and shoots off trailing streaks,
 * then "Sent" checks in. With `onSend`, the form is sent in the background while the
 * plane flies and the button settles on the result; without it, the native submit is
 * held until the plane is gone.
 */
export function PaperPlaneButton({ label = "Send", doneLabel = "Sent", done = false, disabled = false, onSend }: { label?: string; doneLabel?: string; done?: boolean; disabled?: boolean; onSend?: (form: HTMLFormElement) => Promise<boolean> }) {
  const [state, setState] = useState<State>(done ? "done" : "idle");
  const ref = useRef<HTMLButtonElement>(null);
  const sendRef = useRef(onSend);
  useEffect(() => { sendRef.current = onSend; });

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    let timer = 0;
    let busy = false;
    // `submit` only fires once the browser's own validation has passed.
    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      if (timer || busy) return;
      setState("sending");
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const send = sendRef.current;
      if (!send) {
        timer = window.setTimeout(() => HTMLFormElement.prototype.submit.call(form), still ? 0 : FLIGHT_MS);
        return;
      }
      busy = true;
      const flight = new Promise((resolve) => window.setTimeout(resolve, still ? 0 : FLIGHT_MS));
      void Promise.all([send(form).catch(() => false), flight]).then(([sent]) => {
        busy = false;
        setState(sent ? "done" : "idle");
      });
    };
    // Coming back via the back button restores the page mid-flight; reset it.
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      timer = 0;
      setState("idle");
    };
    form.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onShow);
    return () => { window.clearTimeout(timer); form.removeEventListener("submit", onSubmit); window.removeEventListener("pageshow", onShow); };
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    const timer = window.setTimeout(() => setState("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <button ref={ref} className="plane-btn" data-state={state} type="submit" disabled={disabled || state === "sending"} aria-busy={state === "sending"} aria-label={state === "sending" ? "Sending…" : state === "done" ? doneLabel : label}>
      <span className="plane-paper" aria-hidden="true"><span className="plane-label">{label}</span></span>
      <svg className="plane-svg" viewBox="0 0 48 32" aria-hidden="true">
        <path className="plane-trail" d="M-34 30C-20 27-8 24 6 18" />
        <path className="plane-trail plane-trail-b" d="M-28 40C-14 36-2 31 12 24" />
        <path className="plane-wing" d="M2 14 46 2 16 19Z" />
        <path className="plane-fold" d="M16 19 46 2 20 30Z" />
      </svg>
      <span className="plane-status plane-status-sending" aria-hidden="true">Sending…</span>
      <span className="plane-status plane-status-done" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>
        {doneLabel}
      </span>
    </button>
  );
}
