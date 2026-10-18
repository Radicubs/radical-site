import BorderGlow from "@/components/BorderGlow";
import { AnimatedSection } from "@/components/ui/animated-section";
import { PixelArrowButton } from "@/components/ui/pixel-arrow-button";
import { DonateLink } from "@/components/ui/donate-link";
import { getPageText, type SiteSettings } from "@/lib/cms";
import { plain, seasonLabel } from "@/lib/page-text";
export async function FinalCtaSection({settings}:{settings:SiteSettings}){const {shared:t}=await getPageText();return <section className="section"><div className="wrap"><AnimatedSection><BorderGlow className="cta-glow" borderRadius={44} backgroundColor="#0a0f0b" glowColor="118 100% 65%" colors={["#66ff55","#00c700","#0a2e12"]} glowIntensity={1.1} coneSpread={30} fillOpacity={0.35}><div className="cta-grid"><div><p className="eyebrow">{t.ctaEyebrow}</p><p>{plain(t.ctaCopy,{season:seasonLabel(settings.applicationSeason)})}</p></div><div className="actions"><PixelArrowButton href={settings.applyUrl} external>{t.ctaApply}</PixelArrowButton><DonateLink className="btn btn-light" href={settings.donateUrl} /></div></div></BorderGlow></AnimatedSection></div></section>}
