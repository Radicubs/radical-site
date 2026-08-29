export const site = {
  name: "Radicubs",
  teamNumber: "7503",
  location: "Frisco, Texas",
  description:
    "We are an independent robotics team from Frisco, Texas. Our purpose is to provide an outlet for students of Frisco, Texas to pursue their interests in STEM and finance through the FIRST Robotics Competition (FRC).",
  nonprofit: "The Radicubs Robotics Team is recognized as a non-profit organization under a 501(c)(3).",
  donateUrl: "https://www.paypal.com/paypalme/radicubs",
  applyUrl: "https://forms.gle/1ATUvbP28c7cLyFB7",
  email: "contact@radicubs.com",
  instagram: "https://www.instagram.com/theradicubs/",
  linkedin: "https://www.linkedin.com/company/radicubs-robotics",
  tiktok: "https://www.tiktok.com/@theradicubs",
  tba: "https://www.thebluealliance.com/team/7503",
  robotImage: "/radicubs-2026-hero.png",
  markImage: "/favicon.svg",
  wordmarkImage: "/radicubs-wordmark-green.png",
  latestPost: "/blog/week-8-rebuilt-2026"
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Team", href: "/team" },
  { label: "Journey", href: "/journey" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
] as const;
