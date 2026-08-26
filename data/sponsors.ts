export type Sponsor = { name: string; href: string; logo: string; pageLogo?: string; note?: string };

// Corporate sponsors and logos are sourced from the original site's Strapi library.
export const corporateSponsors: Sponsor[] = [
  { name: "Orangestar", href: "https://orangestarco.com/", logo: "/sponsors/orangestar.png" },
  { name: "Texas Workforce Commission", href: "https://www.twc.texas.gov/", logo: "/sponsors/texas-workforce-commission.png" },
  { name: "Lockheed Martin", href: "https://www.lockheedmartin.com/en-us/index.html", logo: "/sponsors/lockheed-martin.png" },
  { name: "Texas Instruments", href: "https://www.ti.com/", logo: "/sponsors/texas-instruments.png" },
  { name: "Gene Haas Foundation", href: "https://ghaasfoundation.org/content/ghf/en/home.html", logo: "/sponsors/gene-haas-foundation.png", pageLogo: "/sponsors/gene-haas-foundation-shield.png" },
  { name: "Intuitive Foundation", href: "https://www.intuitive-foundation.org/", logo: "/sponsors/intuitive-foundation.png" },
  { name: "Argosy Foundation", href: "https://www.argosyfnd.org/", logo: "/sponsors/argosy-foundation.png" },
  { name: "Nokia", href: "https://www.nokia.com/", logo: "/sponsors/nokia.png" },
  { name: "Techie Factory", href: "https://techiefactory.com/", logo: "/sponsors/techie-factory.png" },
  { name: "Quest for the Best", href: "https://qftbfoundation.org/", logo: "/sponsors/quest-for-the-best.png" },
  { name: "Elate Orthodontics", href: "https://elateorthodontics.com/", logo: "/sponsors/elate-orthodontics.png" },
  { name: "Scheels", href: "https://scheels.com/", logo: "/sponsors/scheels.png" }
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
