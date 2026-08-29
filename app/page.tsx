import { FeatureSection } from "@/components/sections/feature-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { Navbar } from "@/components/sections/navbar";
import { SponsorsPreviewSection } from "@/components/sections/sponsors-preview-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { getBlogPosts, getDisciplineImages, getHomepageGallery, getSiteSettings, getSponsors } from "@/lib/cms";
import { getAwards } from "@/lib/tba";

export default async function Home() {
  const [settings, gallery, posts, sponsors, awards, disciplineImages] = await Promise.all([
    getSiteSettings(),
    getHomepageGallery(),
    getBlogPosts(),
    getSponsors(),
    getAwards(),
    getDisciplineImages()
  ]);
  return <main className="relative overflow-hidden"><Navbar settings={settings} /><HeroSection settings={settings} gallery={gallery} /><FeatureSection images={disciplineImages} /><ShowcaseSection posts={posts} /><HowItWorksSection awards={awards} /><SponsorsPreviewSection sponsors={sponsors.corporate} /><FinalCtaSection settings={settings} /><Footer /></main>;
}
