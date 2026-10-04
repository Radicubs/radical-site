export const site = {
  name: "Radicubs",
  teamNumber: "7503",
  location: "Frisco, Texas",
  description:
    "We're Radicubs, a student-run robotics team in Frisco, Texas. Every season, we build a competition robot and handle everything that keeps the team going, from code to fundraising.",
  nonprofit: "Radicubs Robotics Team is a 501(c)(3) nonprofit.",
  donateUrl: "https://www.paypal.com/paypalme/radicubs",
  applyUrl: "https://forms.gle/1ATUvbP28c7cLyFB7",
  email: "contact@radicubs.com",
  instagram: "https://www.instagram.com/theradicubs/",
  linkedin: "https://www.linkedin.com/company/radicubs-robotics",
  tiktok: "https://www.tiktok.com/@theradicubs",
  tba: "https://www.thebluealliance.com/team/7503",
  robotImage: "/radicubs-2026-hero.webp",
  markImage: "/favicon.svg",
  wordmarkImage: "/radicubs-wordmark-green.png",
  latestPost: "/blog/week-8-rebuilt-2026"
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Team", href: "/team" },
  { label: "Journey", href: "/journey" },
  { label: "Outreach", href: "/outreach" },
  { label: "Gallery", href: "/gallery" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
] as const;
