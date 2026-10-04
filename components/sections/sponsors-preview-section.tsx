import Link from "@/components/ui/intent-link";
import { AnimatedSection } from "@/components/ui/animated-section";
import type { Sponsor } from "@/data/sponsors";
import { ThemedImage } from "@/components/ui/themed-image";
import { LogoLoop } from "@/components/LogoLoop";

export function SponsorsPreviewSection({sponsors}:{sponsors:Sponsor[]}){
  const logos=sponsors.slice(0,8).map(s=>{
    const src=s.loopLogo ?? s.logo;
    const className=s.name.toLowerCase().includes("gene haas")
      ? "sponsor-loop-logo-haas"
      : s.name.toLowerCase().includes("texas workforce")
        ? "sponsor-loop-logo-workforce"
        : undefined;
    return {
      node:<ThemedImage src={src} lightSrc={s.lightLoopLogo ?? s.lightLogo} alt={s.name} title={s.name} className={className} loading="lazy" decoding="async" draggable={false}/>,
      href:s.href,
      title:s.name,
      ariaLabel:s.name
    };
  });
  return <section className="section"><div className="wrap"><div className="sponsor-panel"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">Sponsors</p><p className="section-copy">From our first box of parts to the trip to competition, our sponsors help make each season possible.</p></div><Link className="text-link" href="/sponsors">Meet our sponsors →</Link></div></AnimatedSection><div className="sponsor-loop"><LogoLoop logos={logos} speed={52} logoHeight={150} gap={112} pauseOnHover scaleOnHover ariaLabel="Radicubs corporate sponsors"/></div></div></div></section>
}
