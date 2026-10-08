import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import "./refresh.css";
import "./home-reference.css";
import "./theme-light.css";
import { MotionSystem } from "@/components/ui/motion-system";
import ClickSpark from "@/components/ClickSpark";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { SiteLoader } from "@/components/ui/site-loader";
import { NavProgress } from "@/components/ui/nav-progress";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { getSiteSettings } from "@/lib/cms";

// CMS content and media must be read at request time, never frozen during a build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Radicubs | FRC Team 7503",
    description: settings.description,
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
      type: "website"
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          // Plain blocking script (not next/script) so it runs synchronously while
          // <head> parses, before the loader below ever paints on a repeat visit.
          dangerouslySetInnerHTML={{
            __html:
              // Light mode is switched off for now: the saved "radicubs-theme" is ignored and
              // the page stays on the dark theme set on <html>. To bring it back, restore the
              // ThemeToggle in the navbar and apply the saved theme here before first paint.
              'try{if(sessionStorage.getItem("radicubs-loaded")){document.documentElement.setAttribute("data-skip-loader","")}}catch(e){}'
          }}
        />
      </head>
      <body suppressHydrationWarning><NavProgress /><SiteLoader /><StarsBackground className="site-stars" starColor="var(--stars-color)" pointerEvents={false} aria-hidden="true" /><ClickSpark sparkColor="#66ff55" sparkCount={7} sparkRadius={20} sparkSize={7}><div className="site-content">{children}</div></ClickSpark><MotionSystem /><SmoothScroll /></body>
    </html>
  );
}
