import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AuthStrategy, Payload } from "payload";
import { googleLoginEnabled } from "./auth-settings";

// Google sign-in for the editor runs through Supabase Auth. Supabase proves who
// the person is; Payload's Editors list decides whether they're allowed in, so
// only people added under Settings → Editors can sign in (with Google or a password).

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const googleSignInEnabled = googleLoginEnabled && Boolean(supabaseUrl && supabaseKey);

export const hasSupabaseSession = (cookieNames: string[]) =>
  cookieNames.some((name) => name.startsWith("sb-") && name.includes("-auth-token"));

export async function findEditor(payload: Payload, email: string | undefined) {
  if (!email) return null;
  const { docs } = await payload.find({
    collection: "users",
    where: { email: { equals: email.toLowerCase() } },
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  return docs[0] ?? null;
}

export const supabaseStrategy: AuthStrategy = {
  name: "supabase",
  async authenticate({ headers, payload }) {
    if (!googleSignInEnabled) return { user: null };
    const cookies = parseCookieHeader(headers.get("cookie") ?? "");
    if (!supabaseUrl || !supabaseKey || !hasSupabaseSession(cookies.map((cookie) => cookie.name))) return { user: null };

    // Read-only here; middleware.ts keeps the session cookies refreshed.
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => cookies.map(({ name, value }) => ({ name, value: value ?? "" })), setAll: () => {} }
    });
    const { data } = await supabase.auth.getClaims();
    const editor = await findEditor(payload, data?.claims.email as string | undefined);
    return { user: editor ? { ...editor, collection: "users", _strategy: "supabase" } : null };
  }
};
