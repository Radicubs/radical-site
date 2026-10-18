"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Numbers tick up from a nearby value the first time they scroll into view. */
export function CountUp({ value, prefix = "", suffix = "", plain }: { value: number; prefix?: string; suffix?: string; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .6 });
  const reduce = useReducedMotion();
  // Years count up over their last few values so they don't spin through 0–2000.
  const from = plain ? value - 5 : 0;
  // Render the same readable value on the server and during hydration.
  // The motion preference is only applied by the effect after mounting.
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) { setShown(value); return; }
    const controls = animate(from, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, from, value]);

  return <span ref={ref}>{prefix}{shown}{suffix}</span>;
}
