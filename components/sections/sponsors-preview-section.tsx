import Link from "next/link";
import { AnimatedSection } from "@/components/ui/animated-section";
import type { Sponsor } from "@/data/sponsors";
import { LogoLoop } from "@/components/LogoLoop";

export function SponsorsPreviewSection({sponsors}:{sponsors:Sponsor[]}){
  const logos=sponsors.slice(0,8).map(s=>({
    src:s.loopLogo ?? s.logo,
    alt:s.name,
    href:s.href,
    title:s.name,
    className:s.name.toLowerCase().includes("gene haas")
      ? "sponsor-loop-logo-haas"
      : s.name.toLowerCase().includes("texas workforce")
        ? "sponsor-loop-logo-workforce"
        : undefined
  }));
  return <section className="section"><div className="wrap"><div className="sponsor-panel"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">Sponsors</p><p className="section-copy">Corporate and individual sponsors make competition fees, tools, materials, travel, outreach, and workspace possible.</p></div><Link className="text-link" href="/sponsors">Meet our sponsors →</Link></div></AnimatedSection><div className="sponsor-loop"><LogoLoop logos={logos} speed={52} logoHeight={150} gap={112} pauseOnHover fadeOut fadeOutColor="#17191b" scaleOnHover ariaLabel="Radicubs corporate sponsors"/></div></div></div></section>
}
