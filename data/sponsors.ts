// Offline fallback for the Sponsors collection in the CMS.
// `lightLogo` / `lightLoopLogo` are dark-ink copies for the light theme, where white artwork disappears.
export type Sponsor = { name: string; href: string; logo: string; loopLogo?: string; pageLogo?: string; lightLogo?: string; lightLoopLogo?: string; note?: string };

export const corporateSponsors: Sponsor[] = [
  { name: "Orangestar", href: "https://orangestarco.com/", logo: "/sponsors/orangestar.png" },
  { name: "Texas Workforce Commission", href: "https://www.twc.texas.gov/", logo: "/sponsors/texas-workforce-commission.png" },
  { name: "Lockheed Martin", href: "https://www.lockheedmartin.com/en-us/index.html", logo: "/sponsors/lockheed-martin.png" },
  { name: "Texas Instruments", href: "https://www.ti.com/", logo: "/sponsors/texas-instruments.png" },
  { name: "Gene Haas Foundation", href: "https://ghaasfoundation.org/content/ghf/en/home.html", logo: "/sponsors/gene-haas-foundation.png" },
  { name: "Intuitive Foundation", href: "https://www.intuitive-foundation.org/", logo: "/sponsors/intuitive-foundation.png" },
  { name: "Argosy Foundation", href: "https://www.argosyfnd.org/", logo: "/sponsors/argosy-foundation.png" },
  { name: "Nokia", href: "https://www.nokia.com/", logo: "/sponsors/nokia.png" },
  { name: "Techie Factory", href: "https://techiefactory.com/", logo: "/sponsors/techie-factory.png" },
  { name: "Quest for the Best", href: "https://qftbfoundation.org/", logo: "/sponsors/quest-for-the-best.png" },
  { name: "Elate Orthodontics", href: "https://elateorthodontics.com/", logo: "/sponsors/elate-orthodontics.png" },
  { name: "Scheels", href: "https://scheels.com/", logo: "/sponsors/scheels.png" },
  { name: "NASA", href: "https://www.nasa.gov/", logo: "" }
];

export const individualSponsors = [
  "Asher Family",
  "Munch Family",
  "Sood Family",
  "Sarah Hendrickson",
  "Yechuri Family",
  "Chutkay Family",
  "Sahoo Family",
  "Kalisetty Family"
];
