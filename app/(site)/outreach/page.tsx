import { textMetadata } from "@/lib/seo";
import { OutreachBody } from "@/components/outreach/outreach-body";
import { OutreachHero } from "@/components/outreach/outreach-hero";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { getOutreach, getPageText, getSiteSettings } from "@/lib/cms";

export async function generateMetadata() {
  return textMetadata("/outreach", (await getPageText()).outreach);
}

export default async function OutreachPage() {
  const [settings, outreach, { outreach: text }] = await Promise.all([getSiteSettings(), getOutreach(), getPageText()]);

  return <main className="outreach-page">
    <Navbar settings={settings} />
    <OutreachHero video={outreach.heroVideo} poster={outreach.heroPoster} title={text.title} label={text.heroLabel} note={text.heroNote} />
    {/* Scrolls up over the pinned hero video. */}
    <div className="outreach-sheet">
      <OutreachBody content={outreach} text={text} />
      <FinalCtaSection settings={settings} />
      <Footer />
    </div>
  </main>;
}
