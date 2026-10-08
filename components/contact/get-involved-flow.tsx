"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Handshake } from "lucide-react";
import { SparkleButton } from "@/components/ui/sparkle-button";
import { ContinueButton } from "@/components/ui/continue-button";
import { PaperPlaneButton } from "@/components/ui/paper-plane-button";
import "./get-involved-flow.css";

type Step = "choose" | "apply" | "interests" | "who" | "note" | "ask" | "sent";
type Path = "student" | "sponsor" | "other";

// The steps each path walks through, used for the progress bar.
const PATHS: Record<Path, Step[]> = {
  student: ["choose", "apply", "ask"],
  sponsor: ["choose", "interests", "who", "note"],
  other: ["choose", "ask"]
};

const INTERESTS = ["Financial sponsorship", "Parts or materials", "Tools or services", "Mentoring", "Not sure yet"];

type Props = { applyUrl: string; season: string; email: string; turnstileSiteKey: string };

declare global {
  interface Window { turnstile?: {
    render: (el: HTMLElement, options: {
      sitekey: string;
      theme?: string;
      callback: (token: string) => void;
      "response-field": boolean;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
    }) => string;
    remove: (id: string) => void;
  } }
}

/** Turnstile rendered on demand, since the widget only appears on the last step. */
function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id: string | undefined;
    let timer = 0;
    onToken("");
    const mount = () => {
      if (!ref.current) return;
      if (!window.turnstile) { timer = window.setTimeout(mount, 200); return; }
      id = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
        // The form owns one response field, populated only after verification.
        "response-field": false,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
        "timeout-callback": () => onToken("")
      });
    };
    mount();
    return () => { window.clearTimeout(timer); if (id !== undefined) window.turnstile?.remove(id); onToken(""); };
  }, [siteKey, onToken]);
  return <div ref={ref} className="gi-turnstile" />;
}

/**
 * Get involved, as a short onboarding: pick student or sponsor, then a couple of
 * questions. Everything posts to the contact API (through /api/contact) as name, email
 * and message, so the answers are folded into the message text.
 */
export function GetInvolvedFlow({ applyUrl, season, email, turnstileSiteKey }: Props) {
  const params = useSearchParams();
  const result = params.get("message");
  const succeeded = params.get("success") === "true";

  // /contact?topic=student|sponsor (e.g. from the sponsors page) opens partway down that path.
  const topic = params.get("topic");
  const startPath: Path = topic === "student" || topic === "sponsor" ? topic : "other";
  const [history, setHistory] = useState<Step[]>(() =>
    succeeded ? ["sent"] : startPath === "student" ? ["choose", "apply"] : startPath === "sponsor" ? ["choose", "interests"] : ["choose"]
  );
  const [dir, setDir] = useState(1);
  const [path, setPath] = useState<Path>(startPath);
  const [interests, setInterests] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", org: "", note: "" });
  const [error, setError] = useState<string | null>(result && !succeeded ? result : null);
  // Turnstile tokens are single-use, so a failed send remounts the widget for a new one.
  const [attempt, setAttempt] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const step = history[history.length - 1];
  const steps = PATHS[path];
  const index = Math.max(0, steps.indexOf(step));

  const go = (next: Step) => { setDir(1); setHistory((h) => [...h, next]); };
  const back = () => { setDir(-1); setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)); };
  const restart = () => { setDir(-1); setHistory(["choose"]); setPath("other"); setError(null); };
  const choose = (next: Path) => { setPath(next); go(next === "student" ? "apply" : next === "sponsor" ? "interests" : "ask"); };
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: event.target.value }));

  // Validate only the fields on screen before moving on.
  const next = (to: Step) => () => {
    const invalid = panel.current?.querySelector<HTMLInputElement>("input:invalid, textarea:invalid");
    if (invalid) { invalid.reportValidity(); return; }
    go(to);
  };

  // Focus the step's first field (or heading) so keyboard users land in the new step.
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    const target = panel.current?.querySelector<HTMLElement>("input, textarea, h2");
    target?.focus({ preventScroll: true });
  }, [step]);

  const message = path === "sponsor"
    ? `[Sponsor]\nOrganization: ${form.org || "-"}\nInterested in: ${interests.join(", ") || "-"}\n\n${form.note}`
    : path === "student" ? `[Student question]\n\n${form.note}` : form.note;

  const send = async (formEl: HTMLFormElement) => {
    if (!captchaToken) {
      setError("Please complete the verification before sending.");
      return false;
    }
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(formEl) });
      const data = (await response.json()) as { success: boolean; message: string | null };
      if (data.success) { setError(null); go("sent"); return true; }
      setError(data.message ?? "Your message didn't go through.");
    } catch {
      setError("Your message didn't go through.");
    }
    setCaptchaToken("");
    setAttempt((n) => n + 1);
    return false;
  };

  // Enter in a text field shouldn't submit the whole form early.
  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
  };

  // On the steps with a Continue button, Enter continues (unless a button or link has focus).
  const advance = step === "interests" ? () => go("who") : step === "who" ? next("note") : null;
  const advanceRef = useRef(advance);
  useEffect(() => { advanceRef.current = advance; });
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Enter" || event.isComposing || !advanceRef.current) return;
      if ((event.target as Element | null)?.closest("button, a, textarea, select")) return;
      event.preventDefault();
      advanceRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 48 * dir, filter: "blur(4px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -48 * dir, filter: "blur(4px)" }
      };

  let body: ReactNode;
  switch (step) {
    case "choose":
      body = (
        <>
          <h2 tabIndex={-1}>What brings you here?</h2>
          <p className="gi-lead">Tell us what you're interested in and we'll help with the next step.</p>
          <div className="gi-choices">
            <button type="button" className="gi-choice" onClick={() => choose("student")}>
              <span className="gi-choice-icon"><GraduationCap size={22} strokeWidth={1.75} /></span>
              <span className="gi-choice-text"><strong>I&apos;m a student</strong><span>I want to join the team</span></span>
              <ArrowRight className="gi-choice-arrow" size={18} aria-hidden="true" />
            </button>
            <button type="button" className="gi-choice" onClick={() => choose("sponsor")}>
              <span className="gi-choice-icon"><Handshake size={22} strokeWidth={1.75} /></span>
              <span className="gi-choice-text"><strong>I want to sponsor</strong><span>As a company, foundation or family</span></span>
              <ArrowRight className="gi-choice-arrow" size={18} aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="gi-quiet" onClick={() => choose("other")}>Something else? Just send us a message</button>
        </>
      );
      break;

    case "apply":
      body = (
        <>
          <h2 tabIndex={-1}>Applications are open</h2>
          <p className="gi-lead">We&apos;re accepting applications for {season}. The form opens in a new tab and gives you a chance to tell us what you&apos;d like to work on.</p>
          <ul className="gi-notes">
            <li><Check size={16} aria-hidden="true" />You can choose from mechanical, CAD, electrical, programming, business, grants, media, and outreach.</li>
          </ul>
          <div className="gi-actions">
            <SparkleButton href={applyUrl} external>Open the application</SparkleButton>
            <button type="button" className="gi-quiet" onClick={() => go("ask")}>I have a question first</button>
          </div>
        </>
      );
      break;

    case "interests":
      body = (
        <>
          <h2 tabIndex={-1}>How would you like to help?</h2>
          <p className="gi-lead">Pick as many as you like. We'll make sure the right person follows up.</p>
          <div className="gi-pills" role="group" aria-label="Ways to help">
            {INTERESTS.map((item) => {
              const on = interests.includes(item);
              return (
                <button key={item} type="button" className="gi-pill" aria-pressed={on} onClick={() => setInterests((list) => (on ? list.filter((i) => i !== item) : [...list, item]))}>
                  <span className="gi-pill-check"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>{item}
                </button>
              );
            })}
          </div>
          <div className="gi-actions"><ContinueButton onClick={next("who")} /></div>
        </>
      );
      break;

    case "who":
      body = (
        <>
          <h2 tabIndex={-1}>Who should we talk to?</h2>
          <div className="gi-fields">
            <label>Your name<input value={form.name} onChange={set("name")} autoComplete="name" required /></label>
            <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" required /></label>
            <label className="gi-span">Company or organization <em>optional</em><input value={form.org} onChange={set("org")} autoComplete="organization" /></label>
          </div>
          <div className="gi-actions"><ContinueButton onClick={next("note")} /></div>
        </>
      );
      break;

    case "note":
    case "ask":
      body = (
        <>
          <h2 tabIndex={-1}>{step === "note" ? "Anything else we should know?" : path === "student" ? "What would you like to ask?" : "Send us a message"}</h2>
          {step === "ask" && (
            <div className="gi-fields">
              <label>Your name<input value={form.name} onChange={set("name")} autoComplete="name" required /></label>
              <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" required /></label>
            </div>
          )}
          <label className="gi-message">
            {step === "note" ? <>Message <em>optional</em></> : "Message"}
            <textarea rows={5} maxLength={1400} value={form.note} onChange={set("note")} required={step === "ask"} placeholder={step === "note" ? "Timeline, budget, questions…" : "How can we help?"} />
          </label>
          <div className="gi-send">
            <Turnstile key={attempt} siteKey={turnstileSiteKey} onToken={setCaptchaToken} />
            <PaperPlaneButton onSend={send} disabled={!captchaToken} />
          </div>
        </>
      );
      break;

    case "sent":
      body = (
        <>
          <span className="gi-sent-mark"><Check size={26} strokeWidth={2.5} aria-hidden="true" /></span>
          <h2 tabIndex={-1}>Message sent</h2>
          <p className="gi-lead">Thanks for writing. A team member will get back to you by email soon.</p>
          <button type="button" className="gi-quiet" onClick={restart}>Start over</button>
        </>
      );
      break;
  }

  const showProgress = step !== "choose" && step !== "sent";

  return (
    <form className="gi" onKeyDown={onKeyDown}>
      <input type="hidden" name="name" value={form.name} />
      <input type="hidden" name="email" value={form.email} />
      <input type="hidden" name="message" value={message} />
      <input type="hidden" name="cf-turnstile-response" value={captchaToken} />

      <div className="gi-top">
        <button type="button" className="gi-back" onClick={back} aria-label="Back" data-hidden={!showProgress}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div className="gi-progress" aria-hidden={!showProgress} data-hidden={!showProgress}>
          {steps.map((s, i) => <span key={s} data-done={i <= index} />)}
        </div>
        <span className="gi-count" data-hidden={!showProgress}>{index + 1} / {steps.length}</span>
      </div>

      {error && <p className="gi-error" role="alert">{error} You can also email us at <a href={`mailto:${email}`}>{email}</a>.</p>}

      <div className="gi-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            ref={panel}
            className="gi-panel"
            {...slide}
            transition={{ duration: reduce ? 0.15 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>
    </form>
  );
}
