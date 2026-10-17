import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { googleLoginEnabled } from "./cms/auth-settings";

// Keeps a Google (Supabase) sign-in alive while an editor uses /admin: Supabase
// access tokens last an hour, and this swaps in a fresh one before it runs out.
// Requests without a Supabase session pass straight through.
export async function middleware(request: NextRequest) {
  // Next may construct nextUrl with an internal server hostname behind a
  // proxy. The incoming Host header identifies the actual requested domain.
  const hostname = (request.headers.get("host")?.split(":")[0] || request.nextUrl.hostname).toLowerCase();
  const isAdminHost = hostname === "admin.radicubs.com";
  const isPublicHost = hostname === "radicubs.com" || hostname === "www.radicubs.com";
  const pathname = request.nextUrl.pathname;

  // Keep existing bookmarks working, without moving local or preview editors.
  if (isPublicHost && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const destination = new URL(request.nextUrl);
    destination.protocol = "https:";
    destination.host = "admin.radicubs.com";
    destination.port = "";
    if (pathname === "/admin") destination.pathname = "/";
    return NextResponse.redirect(destination, 307);
  }

  if (isAdminHost && pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain", "X-Robots-Tag": "noindex, nofollow" }
    });
  }

  // Payload retains its internal /admin routes; the subdomain's front door
  // renders that dashboard instead of the public homepage.
  const destination = isAdminHost && pathname === "/" ? new URL("/admin", request.url) : null;
  if (destination) destination.search = request.nextUrl.search;
  const makeResponse = () => {
    const response = destination
      ? NextResponse.rewrite(destination, { request })
      : NextResponse.next({ request });
    if (isAdminHost) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  };

  if (!googleLoginEnabled) return makeResponse();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const signedIn = request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
  if (!url || !key || !signedIn) return makeResponse();

  let response = makeResponse();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = makeResponse();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  await supabase.auth.getClaims();
  return response;
}

// The front door and robots.txt only need the middleware on the admin subdomain, so
// public homepage visits skip it (and stay servable straight from the CDN cache).
export const config = {
  matcher: [
    { source: "/", has: [{ type: "host", value: "admin.radicubs.com" }] },
    { source: "/robots.txt", has: [{ type: "host", value: "admin.radicubs.com" }] },
    "/admin/:path*",
    "/api/:path*"
  ]
};
