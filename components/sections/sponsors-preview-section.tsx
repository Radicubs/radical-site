import { LinkArrow } from "@/components/ui/link-arrow";
import Link from "@/components/ui/intent-link";
import { AnimatedSection } from "@/components/ui/animated-section";
import type { Sponsor } from "@/data/sponsors";
import { SponsorMark } from "@/components/ui/sponsor-mark";
import { LogoLoop } from "@/components/LogoLoop";

export function SponsorsPreviewSection({sponsors}:{sponsors:Sponsor[]}){
  // Every sponsor from the Sponsors page, in the same order.
  const logos=sponsors.map(s=>({
    node:<SponsorMark src={s.loopLogo ?? s.logo} lightSrc={s.lightLoopLogo ?? s.lightLogo} alt={s.name}/>,
    href:s.href,
    title:s.name,
    ariaLabel:s.name
  }));
  return <section className="section"><div className="wrap"><div className="sponsor-panel"><AnimatedSection><div className="section-head-row"><div><p className="eyebrow">Sponsors</p><p className="section-copy">From our first box of parts to the trip to competition, our sponsors help make each season possible.</p></div><Link className="text-link" href="/sponsors">Meet our sponsors <LinkArrow direction="right" /></Link></div></AnimatedSection><div className="sponsor-loop"><LogoLoop logos={logos} speed={52} logoHeight={150} gap={112} pauseOnHover scaleOnHover ariaLabel="Radicubs corporate sponsors"/></div></div></div></section>
}
