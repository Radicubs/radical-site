import type { CSSProperties, ReactNode } from "react";
import "./sparkle-button.css";

// Fixed positions (not Math.random) so server and client render the same markup.
const PARTICLES = [
  { x: 8, y: 20, d: 0 }, { x: 18, y: 88, d: 1.1 }, { x: 30, y: 6, d: 0.5 }, { x: 44, y: 94, d: 1.6 },
  { x: 56, y: 10, d: 0.8 }, { x: 68, y: 86, d: 0.2 }, { x: 80, y: 14, d: 1.3 }, { x: 92, y: 78, d: 0.6 },
  { x: 97, y: 30, d: 1.8 }, { x: 3, y: 64, d: 1.4 }
];

const star = "M12 2c.5 4.6 2.4 7.5 10 10-7.6 2.5-9.5 5.4-10 10-.5-4.6-2.4-7.5-10-10 7.6-2.5 9.5-5.4 10-10Z";

/**
 * Link button after Aaron Iker's "Button Hover Animation" (dribbble.com/ai): a glowing
 * pill whose sparkle icon twinkles, a streak of light runs around the edge, and
 * specks drift off it while hovered.
 */
export function SparkleButton({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a className="sparkle-btn" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : null)}>
      <span className="sparkle-btn-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => <i key={i} style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--d": `${p.d}s` } as CSSProperties} />)}
      </span>
      <svg className="sparkle-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path className="sparkle-big" d={star} />
        <path className="sparkle-small sparkle-small-a" d={star} />
        <path className="sparkle-small sparkle-small-b" d={star} />
      </svg>
      <span className="sparkle-btn-label">{children}</span>
    </a>
  );
}
