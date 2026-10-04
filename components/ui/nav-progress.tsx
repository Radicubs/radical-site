"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./nav-progress.css";

// A thin bar that appears the instant an internal link is clicked and
// finishes when the new page renders, so a click never looks ignored while
// the next page is on its way.
export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setState("loading");
    };
    // Capture phase: next/link cancels the click's default action before a
    // bubbling listener would see it.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    setState((current) => (current === "loading" ? "done" : current));
  }, [pathname]);

  useEffect(() => {
    if (state !== "done") return;
    const timer = setTimeout(() => setState("idle"), 400);
    return () => clearTimeout(timer);
  }, [state]);

  return <div className="nav-progress" data-state={state} aria-hidden="true" />;
}
