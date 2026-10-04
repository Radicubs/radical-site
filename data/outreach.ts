// Outreach content for /outreach. Every item is sourced from a Radicubs blog post (linked via `source`).

export type OutreachProgram = {
  key: string;
  title: string;
  copy: string;
  where: string;
};

export const outreachPrograms: OutreachProgram[] = [
  {
    key: "camps",
    title: "Summer camps",
    copy: "At our own RadiCamp, kids get to try robotics for themselves. We also mentored at Techie Factory's five-day camp, helping with LEGO robots, block coding, Minecraft, and Roblox Education.",
    where: "RadiCamp · Techie Factory"
  },
  {
    key: "library",
    title: "Library tech nights",
    copy: "At Frisco Public Library, we bring the robot to Family Tech Night, Teen Tech, and the STEM Fair. Kids can see it up close and ask us how it works.",
    where: "Frisco Public Library"
  },
  {
    key: "workshops",
    title: "Workshops",
    copy: "We help younger students build and experiment at Frisco Ignite's K–8 STEAM workshops and at a robotics workshop we hosted with the Society of Women Engineers.",
    where: "Frisco Ignite · SWE"
  },
  {
    key: "demos",
    title: "Festivals & demos",
    copy: "We take a competition robot to festivals and school science nights, including Colorpalooza and Western Days. Seeing it drive in person usually starts a good conversation.",
    where: "Frisco · Lewisville"
  }
];

export type OutreachEvent = {
  year: number;
  title: string;
  place: string;
  source?: string;
  /** Flyers are shown whole instead of cropped. */
  fit?: "contain";
};

export const outreachEvents: OutreachEvent[] = [
  { year: 2026, title: "RadiCamp 2026", place: "Our summer robotics camp" },
  { year: 2025, title: "Robotics Engineering Workshop", place: "Hosted with the Society of Women Engineers", source: "/blog/build-season-week-1-reefscape-2025" },
  { year: 2024, title: "Frisco Ignite STEAM workshop", place: "Workshops for K–8 students", source: "/blog/crescendo-2024-build-season-week-one" },
  { year: 2023, title: "Lewisville Colorpalooza", place: "City of Lewisville", source: "/blog/2023-2024-offseason-recap" },
  { year: 2023, title: "New Frisco library branch", place: "Frisco Public Library", source: "/blog/charged-up-2023-build-season-week-two" },
  { year: 2022, title: "STEM Fair", place: "Frisco Public Library", source: "/blog/off-season-updates", fit: "contain" },
  { year: 2022, title: "Techie Factory summer camp", place: "Lenovo Legion Esports Center", source: "/blog/off-season-updates" },
  { year: 2022, title: "Family Tech Night & Teen Tech", place: "Frisco Public Library", source: "/blog/off-season-updates" },
  { year: 2022, title: "Western Days Festival", place: "City of Lewisville", source: "/blog/off-season-updates" },
  { year: 2022, title: "Family Science Night", place: "Liberty High School", source: "/blog/radiblog-is-back" }
];


export const outreachStats = [
  { value: 2021, label: "First outreach season", plain: true },
  { value: 10, suffix: "+", label: "Community events" },
  { value: 6, label: "Partner organizations" }
];

export const outreachPartners = [
  "City of Frisco",
  "City of Lewisville",
  "Frisco Public Library",
  "Techie Factory",
  "Frisco Ignite",
  "Society of Women Engineers"
];
