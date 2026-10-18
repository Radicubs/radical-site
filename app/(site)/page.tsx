import { Suspense } from "react";
import { textMetadata, absoluteUrl, serializeJsonLd } from "@/lib/seo";
// Old flowing-menu version kept at components/sections/feature-section.tsx —
// swap this import back to FeatureSection to restore it.
import { DisciplineCardsSection } from "@/components/sections/discipline-cards-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection, HeroPhotoWall } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { Navbar } from "@/components/sections/navbar";
import { SponsorsPreviewSection } from "@/components/sections/sponsors-preview-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { getBlogPosts, getDisciplines, getHomeWallPhotos, getImpactStats, getJourneySeasons, getPageText, getSiteSettings, getSponsors } from "@/lib/cms";
import type { PageText } from "@/lib/page-text";
import { getAwards } from "@/lib/tba";

export async function generateMetadata() {
  return textMetadata("/", (await getPageText()).home);
}

async function loadHomeContent() {
  const awards = getAwards();
  const [posts, sponsors, disciplines, impact, seasons] = await Promise.all([
    getBlogPosts(3), getSponsors(), getDisciplines(), getImpactStats(), getJourneySeasons()
  ]);
  return { posts, sponsors, awards, disciplines, impact, games: Object.fromEntries(seasons.map((season) => [season.year, season.game])) };
}

async function HomeWall({ photos }: { photos: ReturnType<typeof getHomeWallPhotos> }) {
  return <HeroPhotoWall photos={await photos} />;
}

async function HomeAwards({ awards, games, text }: { awards: ReturnType<typeof getAwards>; games: Record<number, string>; text: PageText["home"] }) {
  return <HowItWorksSection awards={await awards} games={games} text={text} />;
}

async function HomeContent({ settings, text, content }: {
  settings: Awaited<ReturnType<typeof getSiteSettings>>;
  text: PageText["home"];
  content: ReturnType<typeof loadHomeContent>;
}) {
  const { posts, sponsors, awards, disciplines, impact, games } = await content;
  return <><ShowcaseSection posts={posts} text={text} /><ImpactSection stats={impact} text={text} /><Suspense fallback={<section className="section" style={{ minHeight: 800 }} aria-hidden="true" />}><HomeAwards awards={awards} games={games} text={text} /></Suspense><SponsorsPreviewSection sponsors={sponsors.corporate} text={text} /><DisciplineCardsSection disciplines={disciplines} text={text} /><FinalCtaSection settings={settings} /><Footer /></>;
}

export default async function Home() {
  // Start reads together, but only settings gates the header and hero text.
  // Gallery expansion and the external awards service stream in independently.
  const photos = getHomeWallPhotos();
  const content = loadHomeContent();
  const [settings, { home: text }] = await Promise.all([getSiteSettings(), getPageText()]);
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
  }) }} /><Navbar settings={settings} handoff />
    <HeroSection settings={settings} text={text} wall={
      <Suspense fallback={<HeroPhotoWall photos={[]} />}>
        <HomeWall photos={photos} />
      </Suspense>
    } />
    <Suspense fallback={<div style={{ minHeight: 1800 }} aria-hidden="true" />}>
      <HomeContent settings={settings} text={text} content={content} />
    </Suspense>
  </main>;
}
