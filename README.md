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
project-specific host and username (`postgres.<project-ref>`). The app selects
transaction mode (port `6543`) on that same shared-pooler host for runtime reads
and writes, while `payload migrate` retains session mode (port `5432`). This
avoids reserving a database backend for every Vercel instance. Preserve the TLS
parameters described in `.env.example`. If `DATABASE_URL` already uses transaction
mode, set `DATABASE_MIGRATION_URL` to the session-pooler URI for migrations.

If Vercel reports `connect ENETUNREACH` with an IPv6 address during migrations,
replace the direct database URI in the applicable Vercel environment with the
session pooler URI and create a new deployment. Supabase's direct database host
uses IPv6 by default; the shared session pooler supports IPv4. See
[Supabase's network compatibility guide](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP).

## Editing content

Open `/admin` to manage blog posts, photo albums, team members, mentors,
sponsors, journey seasons, outreach events, and the homepage/outreach/settings
pages. Public pages read fresh CMS content on each request; repeated reads in the
same request are deduplicated. Bundled data is used only when no database is
configured, so removing CMS records does not restore old content.

Under **People**, create **Team seasons** using the starting year (2025 means
2025–2026) and **Team roles** using the names you want in the role dropdown.
Create a **Team member** with their name and photo, then add **Season assignments**.
Each assignment selects a season and role; the + button can create either option
without leaving the person. For a returning member, open their existing profile
and add a new assignment without removing the old one. Edit a season's row to
change its role or photo independently of earlier seasons. The default profile
photo prefills new assignments; changing it leaves existing season photos intact.

The migration combines recurring profiles whose names match after trimming spaces
and ignoring case. Each season retains its own role and photo, including seasons
without photos. Original merged records are retained privately in the database;
automatic rollback refuses to discard later edits. Different spellings are kept
as separate people. Creating an already-existing name directs the editor to use
the existing profile. The website's season picker shows the member count for each
season; a person without a season assignment stays off the public roster.

The normal `npm run build` applies this migration before building the site.
Deploy the code and migration together. Media uploads use the configured S3
bucket; the bucket's public URL must match `MEDIA_PUBLIC_URL` for `/media` links.

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

Run `npx tsc --noEmit --incremental false` for TypeScript validation and
`npm run build` for migrations and the production build. To build without applying
migrations, use `NEXT_DIST_DIR=.next-build npx next build`.
