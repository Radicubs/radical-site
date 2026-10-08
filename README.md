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

## Vercel deployment

`vercel.json` sets the Next.js framework, installs the committed lockfile with
`npm ci`, builds with `npm run build`, and uses `.next` as the output directory.
Set the Vercel project's Root Directory to the repository root (leave it blank)
and connect it to `Radicubs/radical-site`. Root Directory is a dashboard setting;
it cannot be overridden by `vercel.json`.

Add the required variables from `.env.example` to the deployment environment.
The Supabase certificate in `cms/certs/supabase-ca.crt` is included in server
bundles for database URLs using verified TLS. The build command also runs the
Payload migrations against the configured database.

For `DATABASE_URL`, copy the **Session pooler** URI (port `5432`) from
Supabase's **Connect** dialog, fill in the database password, and preserve the
project-specific host and username (`postgres.<project-ref>`). Use the session
pooler because the build runs migrations with the same connection. Preserve
the TLS parameters described in `.env.example`.

If Vercel reports `connect ENETUNREACH` with an IPv6 address during migrations,
replace the direct database URI in the applicable Vercel environment with the
session pooler URI and create a new deployment. Supabase's direct database host
uses IPv6 by default; the shared session pooler supports IPv4. See
[Supabase's network compatibility guide](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP).

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
