import path from "path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import { Users } from "./cms/collections/Users";
import { Media } from "./cms/collections/Media";
import { Albums, BlogPosts, JourneySeasons, Mentors, OutreachEvents, Sponsors, TeamMembers, TeamRoles, TeamSeasons } from "./cms/collections/content";
import { HomePage, OutreachPage, SiteSettings } from "./cms/globals";
import { googleSignInEnabled } from "./cms/supabase-auth";
import { databaseConnectionString } from "./cms/database-connection";

const root = process.cwd();

// Uploads go to a public Supabase Storage bucket when it's configured, and to
// ./media on disk otherwise (local development without Supabase).
const storage = process.env.S3_BUCKET
  ? [s3Storage({
      bucket: process.env.S3_BUCKET,
      collections: {
        media: {
          // Files are linked as /media/<file> on the site's own domain; next.config.ts
          // forwards those requests to the public Supabase bucket.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => `/media/${[prefix, filename].filter((part): part is string => Boolean(part)).map(encodeURIComponent).join("/")}`
        }
      },
      // Browser uploads go straight to storage, so big videos aren't limited by
      // the hosting platform's request size.
      clientUploads: true,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
        }
      }
    })]
  : [];

// Sites the editor can be used from. Vercel sets VERCEL_URL to the current
// deployment's own address, so preview deployments work too.
const allowedOrigins = [
  "https://radicubs.com",
  "https://www.radicubs.com",
  "https://radicubs.vercel.app",
  "http://localhost:3000",
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
];

export default buildConfig({
  // Left empty so the editor works on whichever of the addresses above it's opened from.
  serverURL: "",
  cors: allowedOrigins,
  csrf: allowedOrigins,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " · Radicubs editor" },
    components: {
      graphics: { Logo: "/cms/admin-components#Logo", Icon: "/cms/admin-components#Icon" },
      beforeDashboard: ["/cms/admin-components#Welcome"],
      afterLogin: googleSignInEnabled ? ["/cms/google-login#GoogleLogin"] : [],
      logout: { Button: "/cms/google-login#LogoutButton" }
    },
    importMap: { baseDir: root }
  },
  collections: [BlogPosts, Albums, JourneySeasons, OutreachEvents, TeamMembers, TeamRoles, TeamSeasons, Mentors, Sponsors, Media, Users],
  globals: [HomePage, OutreachPage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(root, "cms/payload-types.ts") },
  db: postgresAdapter({
    pool: {
      connectionString: databaseConnectionString(process.env.DATABASE_URL || "", {
        migration: process.argv.some((argument) => argument === "migrate" || argument.startsWith("migrate:")),
        migrationUrl: process.env.DATABASE_MIGRATION_URL
      }),
      // Each build worker / serverless instance gets its own pool. Keep it small
      // and release idle connections instead of holding unused clients open.
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000
    },
    // Local development and the live site share one Supabase database, so the
    // schema only changes through migrations (cms/migrations, run by `npm run build`).
    push: false,
    migrationDir: path.resolve(root, "cms/migrations")
  }),
  sharp,
  upload: { limits: { fileSize: 50_000_000 } },
  plugins: storage
});
