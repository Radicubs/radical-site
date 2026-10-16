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
The contact form's Turnstile widget must authorize `radicubs.vercel.app` in
Cloudflare → Turnstile → the widget matching `TURNSTILE_SITE_KEY` → Hostname
Management. Add other deployed hostnames there as needed. Cloudflare error
`110200` means the current hostname is not authorized and prevents email
submission. Keep the widget's site key paired with the secret used by the
contact service; a hostname change does not require replacing the keys.
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

Open `https://admin.radicubs.com` in production (or `/admin` locally) to manage
blog posts, photo albums, team members, mentors,
sponsors, journey seasons, outreach events, and the homepage/outreach/settings
pages. Public pages read fresh CMS content on each request; repeated reads in the
same request are deduplicated. Bundled data is used only when no database is
configured, so removing CMS records does not restore old content.

### Admin subdomain setup

The editor shares this deployment and database with the public site. The admin
subdomain's root renders the Payload dashboard; Payload's own editor links remain
under `/admin` on that subdomain. Production `/admin` bookmarks redirect to the
admin subdomain, preserving nested paths and query strings. Localhost and preview
URLs retain their existing `/admin` access.

Before deploying this routing change:

1. Add `admin.radicubs.com` to the **same Vercel project** under Settings → Domains
   as a domain serving the app, not a redirect to the public domain.
2. In the DNS provider for `radicubs.com`, create the `admin` record using the
   exact target Vercel shows, then wait for domain verification and HTTPS.
3. If Google login is enabled, add
   `https://admin.radicubs.com/auth/callback` to Supabase Authentication → URL
   Configuration → Redirect URLs. Keep local/preview callbacks as needed.
4. Deploy the code, then check email/password login, Google login if enabled,
   editing, media uploads, logout, and an old `radicubs.com/admin` bookmark.

The new origin is allowed for Payload CORS and CSRF. Auth cookies stay on the
hostname where the editor is opened, so editors must sign in again on the new
subdomain. The admin hostname serves a crawler exclusion and noindex headers;
Payload's existing authentication and collection access controls still protect
content. DNS and hosting changes are separate from the code in this repository.

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


## Search engine optimization

`lib/seo.ts` owns public-page titles, descriptions, canonical URLs, and social metadata. `SITE_URL` defaults to `https://radicubs.com`; set it only to the permanent production origin, including the preferred www/non-www form. Temporary Vercel deployments use production canonicals and receive `X-Robots-Tag: noindex, nofollow` when `VERCEL_ENV` is not `production`.

`/sitemap.xml` reads published blog posts from the CMS on each request and includes all public content pages. Redirects, the calibration tool, admin, auth, and API routes are excluded. `/robots.txt` advertises the sitemap; admin/auth/API responses also carry noindex headers, and the calibration page has noindex metadata. These are crawler instructions, not access controls.

The homepage includes Organization and WebSite JSON-LD. Blog pages include BlogPosting JSON-LD, article social metadata, and CMS publication/modification timestamps. Keep CMS excerpts descriptive and media alt text specific to each image. The default sharing image is `public/social-card.png` (1200 × 630); posts use their own cover when available.

After deploying, add the property in Google Search Console and Bing Webmaster Tools, optionally set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` to their supplied tokens, and submit `https://radicubs.com/sitemap.xml`. Check representative URLs with URL Inspection and Google's Rich Results Test. Monitor indexing, search queries, and Core Web Vitals after real traffic arrives; metadata and structured data do not guarantee rankings or enhanced results.


## Loading performance

The site renders content without a boot-screen overlay. The homepage streams its photo wall and lower sections independently; an external awards request does not delay the header, hero, or other sections. Homepage blog reads are limited to three summaries, blog lists omit rich text, and individual posts query their slug directly. CMS reads stay fresh per request, with shared settings reads deduplicated within the request.

Smooth-scroll libraries load after initial rendering; native scrolling works while they load. The photo wall pauses outside the viewport and in hidden tabs, and remains static with reduced motion. Fontsource imports use Latin subsets for the site's English typography.

For performance comparisons, use a production build and the same browser, viewport, network, and CPU throttling before and after changes. Tests without `DATABASE_URL` measure the bundled content path; verify real database latency separately on the deployed site.
