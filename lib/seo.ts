import type { Metadata } from "next";

// Use the production origin even on preview deployments; never derive canonical
// URLs from the request Host header or a temporary Vercel deployment URL.
export const siteUrl = new URL(process.env.SITE_URL || "https://radicubs.com").origin;
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
export const socialImage = {
  url: absoluteUrl("/social-card.png"),
  width: 1200,
  height: 630,
  alt: "Radicubs — FRC Team 7503 in Frisco, Texas"
};

export const seoPages = {
  "/": {
    title: "Radicubs | FRC Team 7503",
    description: "Meet Radicubs, student-run FIRST Robotics Competition Team 7503 in Frisco, Texas. Explore our robots, STEM outreach, team updates, and ways to get involved."
  },
  "/team": {
    title: "Our Robotics Team | Radicubs FRC 7503",
    description: "Meet the students behind Radicubs FRC Team 7503 in Frisco, Texas. Explore our team roster and learn how to join our student-run robotics team."
  },
  "/mentors": {
    title: "Robotics Mentors | Radicubs FRC 7503",
    description: "Meet the mentors supporting Radicubs FRC Team 7503 as students learn engineering, programming, teamwork, and how to build competition robots."
  },
  "/journey": {
    title: "Robots, Seasons & Awards | Radicubs FRC 7503",
    description: "Explore Radicubs FRC Team 7503's robots, competition seasons, and awards since 2019. Follow our robotics journey from Frisco, Texas."
  },
  "/outreach": {
    title: "STEM Outreach & RadiCamp | Radicubs FRC 7503",
    description: "Discover how Radicubs brings STEM to the Frisco community through RadiCamp, library tech nights, hands-on workshops, and robot demonstrations."
  },
  "/gallery": {
    title: "Robotics Photos & Gallery | Radicubs FRC 7503",
    description: "See Radicubs FRC Team 7503 in action: photos from robot build nights, FIRST Robotics competitions, STEM outreach, and team events."
  },
  "/sponsors": {
    title: "Sponsors & Robotics Sponsorship | Radicubs FRC 7503",
    description: "Meet the companies, foundations, and families supporting Radicubs FRC Team 7503. Help Frisco students build robots, compete, and share STEM."
  },
  "/blog": {
    title: "Robotics Blog & Build Updates | Radicubs FRC 7503",
    description: "Follow Radicubs FRC Team 7503's build-season updates, robot engineering, programming progress, competitions, and team news from Frisco, Texas."
  },
  "/contact": {
    title: "Join, Mentor or Sponsor Our Team | Radicubs FRC 7503",
    description: "Contact Radicubs FRC Team 7503 in Frisco, Texas to join the team, become a mentor, sponsor a season, or ask about our robotics and STEM programs."
  }
} as const;

export function pageMetadata(path: string, content: { title: string; description: string; image?: string }): Metadata {
  const { title, description } = content;
  const images = content.image ? [{ url: absoluteUrl(content.image), alt: title }] : [socialImage];
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), siteName: "Radicubs", locale: "en_US", type: "website", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((image) => image.url) }
  };
}

// CMS strings must never be able to close a JSON-LD script element.
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
