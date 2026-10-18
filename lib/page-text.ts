// Every piece of fixed page text the CMS can edit, with the wording used when a field is
// left empty. The "Page text" global in the CMS is built from this list (cms/globals.ts),
// so adding an entry here adds a field there; run `npx payload migrate:create` afterwards.
//
// In the text, *asterisks* mark the green words of a heading, and {name} is filled in by
// the page (e.g. {season} → 2026–2027). Both are explained to editors in the CMS.

// optional: the page can do without it, so typing a single - hides it.
type Entry = { label: string; text: string; long?: boolean; optional?: boolean };
type Page = { label: string; fields: Record<string, Entry> };

const seo = (title: string, description: string) => ({
  seoTitle: { label: "Search result title", text: title },
  seoDescription: { label: "Search result description", text: description, long: true }
});

export const pageTextSchema = {
  shared: {
    label: "Header & footer",
    fields: {
      navHome: { label: "Menu: Home", text: "Home" },
      navTeam: { label: "Menu: Team group", text: "Team" },
      navStudents: { label: "Menu: Students", text: "Students" },
      navStudentsNote: { label: "Menu: Students description", text: "Get to know the people behind the robot" },
      navMentors: { label: "Menu: Mentors", text: "Mentors" },
      navMentorsNote: { label: "Menu: Mentors description", text: "Meet the people who help us learn" },
      navAbout: { label: "Menu: About group", text: "About us" },
      navJourney: { label: "Menu: Journey", text: "Journey" },
      navJourneyNote: { label: "Menu: Journey description", text: "Our seasons, from 2019 to now" },
      navOutreach: { label: "Menu: Outreach", text: "Outreach" },
      navOutreachNote: { label: "Menu: Outreach description", text: "See where we take the robot" },
      navGallery: { label: "Menu: Gallery", text: "Gallery" },
      navSponsors: { label: "Menu: Sponsors", text: "Sponsors" },
      navBlog: { label: "Menu: Blog", text: "Blog" },
      navContact: { label: "Menu: Contact", text: "Contact" },
      navExplore: { label: "Phone menu: heading", text: "Explore" },
      navCta: { label: "Menu button", text: "Get involved" },
      navDonate: { label: "Phone menu: donate link", text: "Donate" },
      ctaEyebrow: { label: "Join banner: small heading", text: "Be part of Radicubs" },
      ctaCopy: { label: "Join banner: text", text: "Want to build with us? Applications for {season} are open. Want to support the team? Donations to our 501(c)(3) are tax-deductible.", long: true },
      ctaApply: { label: "Join banner: apply button", text: "Apply now" },
      footerNavigate: { label: "Footer: links heading", text: "Navigate" },
      footerConnect: { label: "Footer: social heading", text: "Connect" },
      footerCopyright: { label: "Footer: copyright line", text: "© {year} Radicubs Robotics · FRC Team 7503" },
      footerTagline: { label: "Footer: tagline", text: "Independent student-led robotics team · Frisco, Texas" }
    }
  },
  home: {
    label: "Home",
    fields: {
      ...seo("Radicubs | FRC Team 7503", "Meet Radicubs, student-run FIRST Robotics Competition Team 7503 in Frisco, Texas. Explore our robots, STEM outreach, team updates, and ways to get involved."),
      heroDescription: { label: "Intro under the logo", text: "We build robots, compete, and figure things out together in Frisco, Texas.", long: true },
      heroJoin: { label: "Join button", text: "Join the team" },
      heroScroll: { label: "Scroll button", text: "Scroll to explore" },
      updatesEyebrow: { label: "Updates: small heading", text: "Latest updates" },
      updatesCopy: { label: "Updates: text", text: "Here's what we've been building, testing, and learning lately.", long: true },
      updatesLink: { label: "Updates: link", text: "All blog posts" },
      impactTitle: { label: "Impact: heading", text: "Our *impact.*" },
      impactCopy: { label: "Impact: text", text: "What the team adds up to so far.", long: true },
      awardsTitle: { label: "Awards: heading", text: "What we've *won.*" },
      awardsCopy: { label: "Awards: text", text: "Every award we've earned since our rookie year. Select one to see the official result.", long: true },
      awardsTotal: { label: "Awards: total label", text: "Awards since {year}" },
      awardsTeam: { label: "Awards: total label, second line", text: "FRC Team 7503" },
      sponsorsEyebrow: { label: "Sponsors: small heading", text: "Sponsors" },
      sponsorsCopy: { label: "Sponsors: text", text: "From our first box of parts to the trip to competition, our sponsors help make each season possible.", long: true },
      sponsorsLink: { label: "Sponsors: link", text: "Meet our sponsors" },
      disciplinesTitle: { label: "Disciplines: heading", text: "Find where you *fit in.*" },
      disciplinesLink: { label: "Disciplines: link", text: "Meet the team" }
    }
  },
  team: {
    label: "Team",
    fields: {
      ...seo("Our Robotics Team | Radicubs FRC 7503", "Meet the students behind Radicubs FRC Team 7503 in Frisco, Texas. Explore our team roster and learn how to join our student-run robotics team."),
      eyebrow: { label: "Small heading", text: "FRC Team 7503" },
      title: { label: "Heading", text: "Meet the Team" },
      copy: { label: "Intro", text: "The students behind the robot, the late nights, and everything else it takes to run Radicubs.", long: true },
      mentorsButton: { label: "Mentors button", text: "Meet our mentors" },
      applyButton: { label: "Apply button", text: "Apply for {season}" },
      seasonLabel: { label: "Season picker label", text: "Season" },
      empty: { label: "Shown when a season has no members", text: "No members have been assigned to this season yet." }
    }
  },
  mentors: {
    label: "Mentors",
    fields: {
      ...seo("Robotics Mentors | Radicubs FRC 7503", "Meet the mentors supporting Radicubs FRC Team 7503 as students learn engineering, programming, teamwork, and how to build competition robots."),
      eyebrow: { label: "Small heading", text: "Guidance" },
      title: { label: "Heading", text: "Mentors" },
      copy: { label: "Intro", text: "Our mentors share their experience, ask good questions, and help us work through the tough parts. We're grateful to have them in our corner.", long: true },
      back: { label: "Link to students", text: "Meet the students" }
    }
  },
  journey: {
    label: "Journey",
    fields: {
      ...seo("Robots, Seasons & Awards | Radicubs FRC 7503", "Explore Radicubs FRC Team 7503's robots, competition seasons, and awards since 2019. Follow our robotics journey from Frisco, Texas."),
      title: { label: "Heading", text: "Our Journey" },
      copy: { label: "Intro", text: "Every robot has a story. Here's ours, from our first season in 2019 to now.", long: true },
      awards: { label: "Awards label", text: "Awards:" },
      tbaLink: { label: "Blue Alliance link", text: "View season on The Blue Alliance" },
      noPhoto: { label: "Shown when a season has no photo", text: "No robot photo for this season" }
    }
  },
  outreach: {
    label: "Outreach",
    fields: {
      ...seo("STEM Outreach & RadiCamp | Radicubs FRC 7503", "Discover how Radicubs brings STEM to the Frisco community through RadiCamp, library tech nights, hands-on workshops, and robot demonstrations."),
      title: { label: "Heading", text: "Outreach" },
      heroLabel: { label: "Line under the heading", text: "RadiCamp 2026", optional: true },
      heroNote: { label: "Line under the heading, second part", text: "Our summer robotics camp", optional: true },
      whyEyebrow: { label: "Intro: small heading", text: "Why we do it" },
      whyTitle: { label: "Intro: heading", text: "Taking the robot *out.*" },
      whyCopy: { label: "Intro: text", text: "The robot spends plenty of time outside our shop. Since 2021–22, we've taken it to libraries, festivals, camps, and classrooms around Frisco and Lewisville. We plan and run the events ourselves, and we love seeing what kids ask when they get close to a real competition robot.", long: true },
      programsTitle: { label: "Programs: heading", text: "What we *run.*" },
      programsCopy: { label: "Programs: text", text: "Here are a few ways we share robotics with our community.", long: true },
      reelEyebrow: { label: "Events: small heading", text: "On the road" },
      reelTitle: { label: "Events: heading", text: "Where we've *been.*" },
      reelLink: { label: "Events: link on cards", text: "Read the post" },
      partnersEyebrow: { label: "Partners: small heading", text: "With thanks to our partners" }
    }
  },
  gallery: {
    label: "Gallery",
    fields: {
      ...seo("Robotics Photos & Gallery | Radicubs FRC 7503", "See Radicubs FRC Team 7503 in action: photos from robot build nights, FIRST Robotics competitions, STEM outreach, and team events."),
      eyebrow: { label: "Small heading", text: "Team moments" },
      title: { label: "Heading", text: "Gallery" },
      copy: { label: "Intro", text: "Build nights, competitions, outreach, and the moments in between.", long: true },
      empty: { label: "Shown when there are no albums", text: "More team photos are coming soon." }
    }
  },
  sponsors: {
    label: "Sponsors",
    fields: {
      ...seo("Sponsors & Robotics Sponsorship | Radicubs FRC 7503", "Meet the companies, foundations, and families supporting Radicubs FRC Team 7503. Help Frisco students build robots, compete, and share STEM."),
      eyebrow: { label: "Small heading", text: "FRC Team {team}" },
      title: { label: "Heading", text: "Our sponsors" },
      copy: { label: "Intro", text: "We run this team ourselves, but we don't do it alone. The companies, foundations, and families here help pay for the robot, our tools, and the trips that get us to competition.", long: true },
      becomeButton: { label: "Become a sponsor button", text: "Become a sponsor" },
      statCorporate: { label: "Stats: corporate label", text: "Corporate partners" },
      statIndividual: { label: "Stats: individual label", text: "Individual sponsors" },
      statNonprofit: { label: "Stats: nonprofit label", text: "Nonprofit status" },
      statNonprofitValue: { label: "Stats: nonprofit value", text: "501(c)(3)" },
      statNote: { label: "Stats: note", text: "Donations are tax-deductible." },
      corporateEyebrow: { label: "Corporate: small heading", text: "Partners" },
      corporateTitle: { label: "Corporate: heading", text: "Corporate sponsors" },
      corporateCopy: { label: "Corporate: text", text: "These organizations help us turn ideas into a working robot.", long: true },
      openTitle: { label: "Empty logo tile: heading", text: "Your logo here" },
      openLink: { label: "Empty logo tile: link", text: "Partner with Team {team}" },
      individualEyebrow: { label: "Individual: small heading", text: "Community" },
      individualTitle: { label: "Individual: heading", text: "Individual sponsors" },
      individualCopy: { label: "Individual: text", text: "To the families and friends who have pitched in: thank you.", long: true },
      fundsEyebrow: { label: "Support: small heading", text: "Impact" },
      fundsTitle: { label: "Support: heading", text: "What your support builds" },
      fundsCopy: { label: "Support: text", text: "Your support goes straight into the work we do all season.", long: true },
      fund1Title: { label: "Support card 1 (trophy): title", text: "Competition fees" },
      fund1Copy: { label: "Support card 1 (trophy): text", text: "Entry fees for the FIRST Robotics Competition events we attend each season.", long: true },
      fund2Title: { label: "Support card 2 (box): title", text: "Materials & parts" },
      fund2Copy: { label: "Support card 2 (box): text", text: "Aluminum, motors, electronics, and the spares a robot goes through.", long: true },
      fund3Title: { label: "Support card 3 (wrench): title", text: "Tools" },
      fund3Copy: { label: "Support card 3 (wrench): text", text: "The equipment we use to build parts and check that they work.", long: true },
      fund4Title: { label: "Support card 4 (bus): title", text: "Travel" },
      fund4Copy: { label: "Support card 4 (bus): text", text: "Getting the team and the robot to events away from home.", long: true },
      fund5Title: { label: "Support card 5 (megaphone): title", text: "Outreach" },
      fund5Copy: { label: "Support card 5 (megaphone): text", text: "Robot demos, workshops and camps for kids around Frisco.", long: true },
      fund6Title: { label: "Support card 6 (building): title", text: "Workspace" },
      fund6Copy: { label: "Support card 6 (building): text", text: "A place where we can design, build, test, and start over when we need to.", long: true },
      joinEyebrow: { label: "Join: small heading", text: "Get involved" },
      joinTitle: { label: "Join: heading", text: "Join our sponsors" },
      joinCopy: { label: "Join: text", text: "Want to talk through a sponsorship? Email us at {email}.", long: true },
      option1Title: { label: "Join option 1: title", text: "Become a sponsor" },
      option1Copy: { label: "Join option 1: text", text: "Companies, families, and individuals are all welcome. We'll recognize your support here.", long: true },
      option2Title: { label: "Join option 2: title", text: "Make a donation" },
      option2Copy: { label: "Join option 2: text", text: "Give directly to the team. Tax-deductible.", long: true }
    }
  },
  blog: {
    label: "Blog",
    fields: {
      ...seo("Robotics Blog & Build Updates | Radicubs FRC 7503", "Follow Radicubs FRC Team 7503's build-season updates, robot engineering, programming progress, competitions, and team news from Frisco, Texas."),
      title: { label: "Heading", text: "Updates from Team 7503" },
      copy: { label: "Intro", text: "Follow along as we build, compete, try new ideas, and tell you how it went.", long: true },
      back: { label: "Back link on posts", text: "Back to blog" },
      watchVideo: { label: "Video button on posts", text: "Watch video" }
    }
  },
  contact: {
    label: "Contact",
    fields: {
      ...seo("Join, Mentor or Sponsor Our Team | Radicubs FRC 7503", "Contact Radicubs FRC Team 7503 in Frisco, Texas to join the team, become a mentor, sponsor a season, or ask about our robotics and STEM programs."),
      title: { label: "Heading", text: "Get involved" },
      copy: { label: "Intro", text: "Thinking about joining us? Want to sponsor a season? We'd love to hear from you. You can also email {email}.", long: true },
      chooseTitle: { label: "Step 1: heading", text: "What brings you here?" },
      chooseLead: { label: "Step 1: text", text: "Tell us what you're interested in and we'll help with the next step.", long: true },
      studentTitle: { label: "Step 1: student choice", text: "I'm a student" },
      studentNote: { label: "Step 1: student choice, second line", text: "I want to join the team" },
      sponsorTitle: { label: "Step 1: sponsor choice", text: "I want to sponsor" },
      sponsorNote: { label: "Step 1: sponsor choice, second line", text: "As a company, foundation or family" },
      otherLink: { label: "Step 1: message link", text: "Something else? Just send us a message" },
      applyTitle: { label: "Students: heading", text: "Applications are open" },
      applyLead: { label: "Students: text", text: "We're accepting applications for {season}. The form opens in a new tab and gives you a chance to tell us what you'd like to work on.", long: true },
      applyNote: { label: "Students: note", text: "You can choose from mechanical, CAD, electrical, programming, business, grants, media, and outreach.", long: true },
      applyButton: { label: "Students: application button", text: "Open the application" },
      applyQuestion: { label: "Students: question link", text: "I have a question first" },
      interestsTitle: { label: "Sponsors: heading", text: "How would you like to help?" },
      interestsLead: { label: "Sponsors: text", text: "Pick as many as you like. We'll make sure the right person follows up.", long: true },
      interestsOptions: { label: "Sponsors: choices (one per line)", text: "Financial sponsorship\nParts or materials\nTools or services\nMentoring\nNot sure yet", long: true },
      whoTitle: { label: "Sponsors: contact details heading", text: "Who should we talk to?" },
      noteTitle: { label: "Sponsors: last step heading", text: "Anything else we should know?" },
      notePlaceholder: { label: "Sponsors: message placeholder", text: "Timeline, budget, questions…" },
      askStudentTitle: { label: "Student question heading", text: "What would you like to ask?" },
      askTitle: { label: "Message heading", text: "Send us a message" },
      askPlaceholder: { label: "Message placeholder", text: "How can we help?" },
      nameLabel: { label: "Name field label", text: "Your name" },
      emailLabel: { label: "Email field label", text: "Email" },
      orgLabel: { label: "Organization field label", text: "Company or organization" },
      messageLabel: { label: "Message field label", text: "Message" },
      sentTitle: { label: "Sent: heading", text: "Message sent" },
      sentLead: { label: "Sent: text", text: "Thanks for writing. A team member will get back to you by email soon.", long: true },
      startOver: { label: "Sent: start over link", text: "Start over" }
    }
  },
  notFound: {
    label: "Missing page (404)",
    fields: {
      kicker: { label: "Small heading", text: "FRC Team 7503 · Frisco, TX" },
      title: { label: "Heading", text: "Looks like we lost this page." },
      copy: { label: "Text", text: "Even our best builds need a fix now and then. Let's get you back to the team.", long: true },
      hint: { label: "Hint", text: "Hold the click to hit hyperspeed." },
      homeButton: { label: "Home button", text: "Back to home" },
      journeyButton: { label: "Journey button", text: "See our journey" }
    }
  }
} satisfies Record<string, Page>;

type Schema = typeof pageTextSchema;
export type PageKey = keyof Schema;
export type PageText = { [P in PageKey]: { [F in keyof Schema[P]["fields"]]: string } };

const pages = Object.entries(pageTextSchema) as [PageKey, Page][];

export const defaultPageText = Object.fromEntries(
  pages.map(([page, { fields }]) => [page, Object.fromEntries(Object.entries(fields).map(([name, entry]) => [name, entry.text]))])
) as PageText;

const hideable = (page: PageKey, name: string) => Boolean((pageTextSchema[page].fields as Record<string, Entry>)[name]?.optional);

/** Saved text over the defaults, as typed: a field left empty (or added since the last save) gets its default. */
export function fillDefaults(saved: unknown): PageText {
  const doc = (saved ?? {}) as Record<string, Record<string, unknown> | null | undefined>;
  return Object.fromEntries(pages.map(([page, { fields }]) => [page, Object.fromEntries(Object.keys(fields).map((name) => {
    const value = doc[page]?.[name];
    return [name, typeof value === "string" && value.trim() ? value : defaultPageText[page][name as never]];
  }))])) as PageText;
}

/** The text the site shows: fillDefaults, with optional lines set to - turned into empty strings. */
export function withDefaults(saved: unknown): PageText {
  const text = fillDefaults(saved) as Record<PageKey, Record<string, string>>;
  for (const [page, fields] of Object.entries(text) as [PageKey, Record<string, string>][]) {
    for (const name of Object.keys(fields)) if (fields[name].trim() === "-" && hideable(page, name)) fields[name] = "";
  }
  return text as PageText;
}

/** Text for places that can't show formatting (titles, placeholders): drops the asterisks, fills {names}. */
export function plain(text: string, values: Record<string, string | number> = {}) {
  return text.replace(/\*([^*]+)\*/g, "$1").replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

/** "2026–2027": the season applications are for. */
export const seasonLabel = (year: number) => `${year}–${year + 1}`;
