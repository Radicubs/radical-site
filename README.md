# Radicubs × Maya Rebuild

A Next.js 15 / React 19 rebuild of **Radicubs FRC Team 7503**, using the responsive grid, glass-card language, large-radius surfaces, and Framer Motion patterns from the supplied Maya template while replacing the Maya product content with current Radicubs material.

## Included routes

- `/`: Radicubs landing page, latest updates, awards, sponsors preview, join/support CTAs
- `/team`: current team roster and live-site portraits
- `/mentors`: current mentor roster
- `/sponsors`: dedicated corporate + individual sponsors page, donate/sponsor actions
- `/blog`: Radicubs blog archive
- `/blog/[slug]`: complete 2026 REBUILT weekly posts + archive landing pages for older entries
- `/contact`: contact form shell, email and application actions

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Content / asset sourcing

Current navigation, mission copy, team roster, mentor roster, awards, individual sponsor names, blog titles and dates, 2026 blog copy, PayPal link, application link, robot image, favicon mark, team portraits, sponsor artwork, and blog covers were mapped from the original site and its CMS. All site-owned media is stored locally in this project.

The live site serves many images from hashed Astro/CDN URLs. Those URLs are kept in the structured data files so the project does not ship recompressed copies and remains visually faithful to the public source. If long-term archival independence is required, download those URLs and replace the strings in `data/team.ts`, `data/blog.ts`, and `data/site.ts` with local `/public` paths.

The public sponsor page exposes **Corporate Sponsors** and **Individual Sponsors**, not Platinum/Gold/Silver tiers, so the rebuild preserves that hierarchy rather than inventing tiers. Corporate names are cross-checked against Team 7503's current public FIRST sponsor listings and public 2026 sponsorship announcements.

## Design tokens

Radicubs' established dark/green brand system is represented by:

- `--radicubs-dark: #222222`
- `--radicubs-green: #00c700`
- bright accent `#66ff55`
- Roboto/Arial sans-serif stack

The dark and green values are consistent with Radicubs' prior public stylesheet; the brighter green is used to match the current favicon/mark on dark surfaces.

## Validation

`npx tsc --noEmit` passes in the build workspace. The supplied Maya ZIP contained a macOS-only Next SWC binary, and the isolated build environment cannot access npm to download the Linux SWC package, so `next build` cannot complete inside this sandbox. A normal `npm install` on the deployment machine will install the correct platform binary before `npm run build`.
