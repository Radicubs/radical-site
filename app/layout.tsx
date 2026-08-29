import type { Metadata } from "next";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { MotionSystem } from "@/components/ui/motion-system";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import ClickSpark from "@/components/ClickSpark";
import { getSiteSettings } from "@/lib/cms";

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
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body suppressHydrationWarning><InteractiveBackground /><ClickSpark sparkColor="#66ff55" sparkCount={7} sparkRadius={20} sparkSize={7}><div className="site-content">{children}</div></ClickSpark><MotionSystem /></body>
    </html>
  );
}
