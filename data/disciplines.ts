// Backup copy of the homepage discipline cards, used if the CMS can't be reached.
export type Discipline = { key: string; title: string; copy: string; tags: [string, string, string]; alt: string };

export const disciplines: Discipline[] = [
  { key: "mechanical", title: "Mechanical", copy: "We turn sketches into working parts, then test, break, and fix them until they hold up on the field.", tags: ["Fabrication", "Prototyping", "Assembly"], alt: "Two students measuring and cutting aluminium in the Radicubs shop" },
  { key: "cad", title: "CAD", copy: "Before anyone cuts metal, we work through the design on screen and make sure the pieces fit together.", tags: ["3D modelling", "Design review", "Drawings"], alt: "Students reviewing a design on screen in front of the Radicubs banner" },
  { key: "electrical", title: "Electrical", copy: "We wire the motors, sensors, and controls, then chase down the problems that show up between matches.", tags: ["Wiring", "Power", "Sensors"], alt: "Students wiring the electronics on the robot" },
  { key: "programming", title: "Programming", copy: "We write the code that drives the robot and keep tuning it until it responds the way our drivers need.", tags: ["Autonomous", "Controls", "Testing"], alt: "A laptop running the robot's vision-tracking dashboard" },
  { key: "business", title: "Business", copy: "We keep the team running: budgets, sponsors, plans, and award submissions all happen here.", tags: ["Finance", "Sponsors", "Planning"], alt: "Team members holding award plaques beside the robot" },
  { key: "grants", title: "Grants", copy: "We find funding and write the applications that help pay for parts, tools, travel, and event fees.", tags: ["Research", "Writing", "Funding"], alt: "The whole Radicubs team with the 7503 letters and team banner" },
  { key: "media", title: "Media", copy: "We photograph the late nights and match days, make graphics, and share what the team's up to.", tags: ["Photo & video", "Design", "Social"], alt: "Radicubs members cheering from the stands at a competition" },
  { key: "outreach", title: "Outreach", copy: "We take robotics beyond the shop with demos, workshops, and camps for local kids and families.", tags: ["Events", "Workshops", "Community"], alt: "A Radicubs member running a hands-on activity with young children" }
];
