import { pageMetadata, seoPages, absoluteUrl, serializeJsonLd } from "@/lib/seo";
// Old flowing-menu version kept at components/sections/feature-section.tsx —
// swap this import back to FeatureSection to restore it.
import { DisciplineCardsSection } from "@/components/sections/discipline-cards-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { Navbar } from "@/components/sections/navbar";
import { SponsorsPreviewSection } from "@/components/sections/sponsors-preview-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { VideoStorySection } from "@/components/sections/video-story-section";
import { getBlogPosts, getDisciplines, getHomeVideos, getHomeWallPhotos, getJourneySeasons, getSiteSettings, getSponsors } from "@/lib/cms";
import { getAwards } from "@/lib/tba";

export const metadata = pageMetadata("/", seoPages["/"]);

export default async function Home() {
  const [settings, posts, sponsors, awards, wallPhotos, disciplines, videos, seasons] = await Promise.all([
    getSiteSettings(),
    getBlogPosts(),
    getSponsors(),
    getAwards(),
    getHomeWallPhotos(),
    getDisciplines(),
    getHomeVideos(),
    getJourneySeasons()
  ]);
  const games = Object.fromEntries(seasons.map((season) => [season.year, season.game]));
  return <main className="relative home-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: settings.name,
        alternateName: `FRC Team ${settings.teamNumber}`,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/android-chrome-512x512.png"),
        description: settings.description,
        email: settings.email,
        address: { "@type": "PostalAddress", addressLocality: "Frisco", addressRegion: "TX", addressCountry: "US" },
        sameAs: [settings.instagram, settings.linkedin, settings.tiktok, settings.tba].filter(Boolean)
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: settings.name,
        alternateName: `Radicubs FRC ${settings.teamNumber}`,
        url: absoluteUrl("/"),
        inLanguage: "en-US",
        publisher: { "@id": absoluteUrl("/#organization") }
      }
    ]
  }) }} /><Navbar settings={settings} /><HeroSection settings={settings} photos={wallPhotos} /><SponsorsPreviewSection sponsors={sponsors.corporate} /><DisciplineCardsSection disciplines={disciplines} /><VideoStorySection videos={videos} /><ShowcaseSection posts={posts} /><HowItWorksSection awards={awards} games={games} /><FinalCtaSection settings={settings} /><Footer /></main>;
}
