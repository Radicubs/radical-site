import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "./globals.css";
import "./refresh.css";
import "./home-reference.css";
import "./theme-light.css";
import "./responsive.css";
import "./large-screens.css";
import { MotionSystem } from "@/components/ui/motion-system";
import ClickSpark from "@/components/ClickSpark";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { SiteLoader } from "@/components/ui/site-loader";
import { NavProgress } from "@/components/ui/nav-progress";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { getSiteSettings } from "@/lib/cms";
import { siteUrl, socialImage } from "@/lib/seo";

// CMS content and media must be read at request time, never frozen during a build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: "Radicubs | FRC Team 7503",
    description: settings.description,
    applicationName: "Radicubs",
    category: "education",
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined
    },
    twitter: { card: "summary_large_image", title: "Radicubs | FRC Team 7503", description: settings.description, images: [socialImage.url] },
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
    },
    openGraph: {
      title: "Radicubs | FRC Team 7503",
      description: settings.description,
      type: "website",
      siteName: "Radicubs",
      locale: "en_US",
      images: [socialImage]
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'try{if(sessionStorage.getItem("radicubs-loaded-v2")){document.documentElement.setAttribute("data-skip-loader","")}}catch(e){}' }} />
        <noscript><style>{".site-loader{display:none!important}"}</style></noscript>
      </head>
      <body suppressHydrationWarning><SiteLoader /><NavProgress /><StarsBackground className="site-stars" starColor="var(--stars-color)" pointerEvents={false} aria-hidden="true" /><ClickSpark sparkColor="#66ff55" sparkCount={7} sparkRadius={20} sparkSize={7}><div className="site-content">{children}</div></ClickSpark><MotionSystem /><SmoothScroll /></body>
    </html>
  );
}
