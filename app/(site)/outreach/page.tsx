import type { Metadata } from "next";
import { OutreachBody } from "@/components/outreach/outreach-body";
import { OutreachHero } from "@/components/outreach/outreach-hero";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { getOutreach, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Outreach | Radicubs",
  description: "How Radicubs FRC Team 7503 brings STEM to the community through RadiCamp, library tech nights, workshops and robot demos."
};

export default async function OutreachPage() {
  const [settings, outreach] = await Promise.all([getSiteSettings(), getOutreach()]);

  return <main className="outreach-page">
    <Navbar settings={settings} />
    <OutreachHero video={outreach.heroVideo} poster={outreach.heroPoster} />
    {/* Scrolls up over the pinned hero video. */}
    <div className="outreach-sheet">
      <OutreachBody content={outreach} />
      <FinalCtaSection settings={settings} />
      <Footer />
    </div>
  </main>;
}
