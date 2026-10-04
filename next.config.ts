import path from "path";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

// Files in /public are served with `max-age=0` by default, so browsers
// revalidate every image and video on every visit. Let them keep static media
// for a week and refresh quietly after that. Replacing a file? Give it a new
// name so visitors pick it up immediately.
const STATIC_MEDIA_CACHE = "public, max-age=604800, stale-while-revalidate=2592000";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // pg reads this certificate from DATABASE_URL at runtime, outside Next's static imports.
  outputFileTracingIncludes: {
    "/*": ["./cms/certs/supabase-ca.crt"]
  },
  // Lets a production build run beside a dev server without sharing .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }
    ]
  },
  experimental: {
    // Tree-shake the icon barrel so pages only ship the icons they use.
    optimizePackageImports: ["lucide-react"],
    // One stylesheet per page instead of one per component group: fewer
    // requests (each counts against the plan's request allowance), same CSS.
    cssChunking: false
  },
  // Uploaded photos and videos live in a public Supabase Storage bucket, but are
  // served from the site's own domain as /media/<file>. Vercel's CDN caches them
  // too, which keeps Supabase's download allowance for cache misses only.
  async rewrites() {
    const bucket = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "");
    return bucket ? [{ source: "/media/:path*", destination: `${bucket}/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: "/:all*(\\.avif|\\.webp|\\.png|\\.jpg|\\.jpeg|\\.JPG|\\.PNG|\\.gif|\\.svg|\\.ico|\\.mp4|\\.webm|\\.glb)",
        headers: [{ key: "Cache-Control", value: STATIC_MEDIA_CACHE }]
      },
      {
        source: "/robot/scrollcraft.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }]
      }
    ];
  },
  webpack(config, { isServer, dev }) {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    // Fewer, larger shared JS chunks for the browser, for the same reason.
    if (!isServer && !dev && config.optimization?.splitChunks) {
      config.optimization.splitChunks.maxInitialRequests = 6;
      config.optimization.splitChunks.minSize = 60000;
    }
    return config;
  }
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
