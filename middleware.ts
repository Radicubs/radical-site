import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { googleLoginEnabled } from "./cms/auth-settings";

// Keeps a Google (Supabase) sign-in alive while an editor uses /admin: Supabase
// access tokens last an hour, and this swaps in a fresh one before it runs out.
// Requests without a Supabase session pass straight through.
export async function middleware(request: NextRequest) {
  if (!googleLoginEnabled) return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const signedIn = request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
  if (!url || !key || !signedIn) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/:path*"] };
