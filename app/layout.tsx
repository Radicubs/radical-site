import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MotionSystem } from "@/components/ui/motion-system";
import { InteractiveBackground } from "@/components/ui/interactive-background";

// Self-hosted via Next.js's font optimizer: the actual Inter font files are
// downloaded once at build time and served from this site's own origin, so
// every browser renders the same typeface instead of each falling back to
// whatever "Inter"/"Roboto" substitute its OS happens to pick (which is why
// Safari looked different from other browsers — nothing was ever loading a
// real "Inter", every engine was just guessing its own fallback). It also
// ships as a true variable font, so the font-weight:950/900/800 values used
// throughout globals.css render as real interpolated weights instead of a
// browser's crude synthetic-bold guess on top of Arial.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Radicubs | FRC Team 7503",
  description: "We are an independent robotics team from Frisco, Texas. Our purpose is to provide an outlet for students of Frisco, Texas to pursue their interests in STEM and finance through the FIRST Robotics Competition (FRC).",
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
    description: "We are an independent robotics team from Frisco, Texas. Our purpose is to provide an outlet for students of Frisco, Texas to pursue their interests in STEM and finance through the FIRST Robotics Competition (FRC).",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning><InteractiveBackground /><div className="site-content">{children}</div><MotionSystem /></body>
    </html>
  );
}
