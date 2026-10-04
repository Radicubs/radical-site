import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import Link from "@/components/ui/intent-link";
import "./glow-button.css";

type GlowButtonProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

/** Compact call-to-action wrapped in the footer's BorderGlow; the edge lights up toward the cursor. */
export function GlowButton({ href, children, external, className }: GlowButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      <span className="glow-btn-icon" aria-hidden="true"><ArrowUpRight size={16} strokeWidth={2.25} /></span>
    </>
  );
  return (
    <BorderGlow
      className={["glow-btn", className].filter(Boolean).join(" ")}
      borderRadius={14}
      glowRadius={22}
      edgeSensitivity={18}
      backgroundColor="#0b100b"
      glowColor="118 100% 65%"
      colors={["#66ff55", "#00c700", "#0a2e12"]}
      glowIntensity={1.2}
      coneSpread={30}
      fillOpacity={0.4}
      animated
    >
      {external ? (
        <a className="glow-btn-link" href={href} target="_blank" rel="noreferrer">{content}</a>
      ) : (
        <Link className="glow-btn-link" href={href}>{content}</Link>
      )}
    </BorderGlow>
  );
}
