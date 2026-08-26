import { FeatureSection } from "@/components/sections/feature-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { Navbar } from "@/components/sections/navbar";
import { SponsorsPreviewSection } from "@/components/sections/sponsors-preview-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";

export default function Home() {
  return <main className="relative overflow-hidden"><Navbar /><HeroSection /><FeatureSection /><ShowcaseSection /><HowItWorksSection /><SponsorsPreviewSection /><FinalCtaSection /><Footer /></main>;
}
