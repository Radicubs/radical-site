"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { OutreachStat } from "@/lib/cms";

/** Numbers tick up from a nearby value the first time the row scrolls into view. */
function CountUp({ value, suffix = "", plain }: { value: number; suffix?: string; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .6 });
  const reduce = useReducedMotion();
  // Years count up over their last few values so they don't spin through 0–2000.
  const from = plain ? value - 5 : 0;
  const [shown, setShown] = useState(reduce ? value : from);

  useEffect(() => {
    if (!inView || reduce) { setShown(value); return; }
    const controls = animate(from, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, from, value]);

  return <span ref={ref}>{shown}{suffix}</span>;
}

export function OutreachStats({ stats }: { stats: OutreachStat[] }) {
  return <dl className="outreach-stats">
    {stats.map((stat) => <div key={stat.label} className="outreach-cell">
      <dt>{stat.label}</dt>
      <dd><CountUp value={stat.value} suffix={stat.suffix} plain={stat.plain} /></dd>
    </div>)}
  </dl>;
}
