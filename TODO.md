# Site Redesign TODO

Legend: `[x]` already built · `[~]` partially built / needs rework · `[ ]` not built

Based on reading the current codebase (`src/pages`, `src/components`, `src/lib/contentTypes.d.ts`). No code changed yet — this is scoping only.

## Home page (`src/pages/index.astro`)

- [x] Sponsors spot — `<CorporateSponsors />` already rendered under an "Sponsors" heading
- [x] Trophy case — `Awards.astro` already pulls every award from The Blue Alliance (not Strapi) and renders it as a year-by-year vertical timeline next to the team photo. Content-wise this is "all awards we've won," but it's a scrolling timeline, not a case/grid. Decide if the timeline treatment is fine or if you want a literal trophy-case grid.
- [ ] Impact spot — no Impact page or data model exists yet (see below). Need: query most-recent N impact events, card layout, "View Impact" button.
- [x] Blog spot — added an "All blog posts" link (`Link` + `External`, same pattern as team.astro's "View mentors"), left-aligned below the 3 latest posts, linking to `/blog`
- [x] Team photo — `home.attributes.image`, shown beside the awards timeline

## About page — new

- [ ] Page doesn't exist (`src/pages/about.astro`)
- [ ] Needs a Strapi singleton (e.g. `About`) with fields for About Us, Mission, and Values/Diversity — decide if these are 3 separate rich-text fields or 3 sub-sections of one page

## History page — new

- [ ] Page doesn't exist
- [ ] Needs a new `Season` collection: name, robot photo, robot name, year, description
- [ ] Vertical timeline layout — `Awards.astro`'s existing year-track/node CSS pattern is close to what's needed here and could be adapted rather than built from scratch

## Impact page — new

- [ ] Page doesn't exist
- [ ] Needs a new `Project`/`ImpactEvent` collection: title, description, optional button (label + link), optional picture, and a way to mark past vs. current (status field or date range)
- [ ] Card layout, page split into "Current" and "Past" sections

## Gallery page

- [~] `src/pages/_gallery.astro` already exists — album grid with cover image + title, links out to `/gallery/[album]`. It's currently disabled: filename prefixed with `_` (won't route) and the nav link is commented out in `Nav.astro`, presumably for the memory reason you mentioned.
- [ ] Current `Album` content type (`title`, `cover`, `images`) has no year field, so it can't be grouped by year yet
- [ ] Decide: rework as Year → Albums → Photos (add year to `Album` or add a parent `Year`/collection) with an eye on memory (e.g. paginate/lazy-load images), or drop it per your fallback instruction

## Team page (`src/pages/team.astro`)

- [x] Roster / year switcher — already works via `getYears()`/`getTeamMembers()`, keep as-is
- [ ] Currently one `TeamMember` collection holds name + role + year together. Split into two collections: a `Person` (name, avatar, bio, etc., no year) and a `RosterEntry` (person relation + role + year) — matches how you described the Strapi split
- [x] Application section already exists (`Application.astro`), currently a link-out banner over the header
- [ ] "Application tips" content/section — doesn't exist
- [ ] "Application timeline" content/section — doesn't exist
- [x] Button to the application form — already there via `home.attributes.applicationUrl`
- [x] Disable toggle for the whole application section — right now it's implicit: the banner (and the links on Team/Contact) only render `applicationUrl` is set on the `Home` singleton. Clearing that field does hide it, but it's shared across multiple pages and doubles as the literal link. Probably want an explicit `applicationsOpen` boolean instead of overloading the URL field.

## Blog page

- [x] No changes requested — keep as-is

## Sponsors page (`src/pages/sponsors.astro`)

- [x] Corporate sponsor logos already shown via `<CorporateSponsors />`
- [ ] Individual sponsors are currently a plain text list (just `name`) — add photos if you want them shown, needs a media field on `IndividualSponsor`
- [~] "Download sponsorship packet" button — code is in place (conditional `.cta-button` reading `home.attributes.sponsorshipPacket`), but the field doesn't exist on the live Strapi `Home` singleton yet, so the button won't appear until you add a `sponsorshipPacket` media field there and upload the PDF. Type stub added to `contentTypes.d.ts` in the meantime; regenerate it for real once the field exists.
- [x] Button that links directly to the email — moved to the Contact page instead, as an alternate to the form (not on Sponsors): a `mailto:` link using a new `CONTACT_EMAIL` env var (set to `contact@radicubs.com`, documented in README)
- [x] "Ways to support" section — added at the top of the Sponsors page with Donate (`DONATE_URL`) and Become a Sponsor cards
- [ ] "Sponsorship benefits" section in card format — needs new content, likely a `SponsorshipBenefit` collection (title, description, icon/image) or could be hardcoded if benefits rarely change

## Strapi content-type summary

New: `Season` (History), `Project`/`ImpactEvent` (Impact), `About` singleton, `SponsorshipBenefit` (Sponsors, optional), `Person` + `RosterEntry` (replaces `TeamMember`)
Changed: `Album` (add year grouping), `IndividualSponsor` (add photo), `Home`/new singleton (add packet file, `applicationsOpen` boolean)
Unchanged: `BlogPost`, `CorporateSponsor`, `Mentor`
