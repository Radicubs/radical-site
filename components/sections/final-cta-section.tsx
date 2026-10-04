import BorderGlow from "@/components/BorderGlow";
import { AnimatedSection } from "@/components/ui/animated-section";
import { PixelArrowButton } from "@/components/ui/pixel-arrow-button";
import { DonateLink } from "@/components/ui/donate-link";
import type { SiteSettings } from "@/lib/cms";
export function FinalCtaSection({settings}:{settings:SiteSettings}){return <section className="section"><div className="wrap"><AnimatedSection><BorderGlow className="cta-glow" borderRadius={44} backgroundColor="#0a0f0b" glowColor="118 100% 65%" colors={["#66ff55","#00c700","#0a2e12"]} glowIntensity={1.1} coneSpread={30} fillOpacity={0.35}><div className="cta-grid"><div><p className="eyebrow">Be part of Radicubs</p><p>Want to build with us? Applications for {settings.applicationSeason}–{settings.applicationSeason + 1} are open. Want to support the team? Donations to our 501(c)(3) are tax-deductible.</p></div><div className="actions"><PixelArrowButton href={settings.applyUrl} external>Apply now</PixelArrowButton><DonateLink className="btn btn-light" href={settings.donateUrl} /></div></div></BorderGlow></AnimatedSection></div></section>}
