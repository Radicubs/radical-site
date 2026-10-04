import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { findEditor, googleSignInEnabled, supabaseKey, supabaseUrl } from "@/cms/supabase-auth";

// Google sends the editor back here after they pick an account. Turn the one-time
// code into a Supabase session (stored in cookies), then let them into /admin if
// their email is on the editor list.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!googleSignInEnabled) return to("/admin/login");
  if (!code || !supabaseUrl || !supabaseKey) return to("/admin/login?error=google-failed");

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
    }
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return to("/admin/login?error=google-failed");

  const editor = await findEditor(await getPayload({ config }), data.user.email);
  if (!editor) {
    await supabase.auth.signOut();
    return to("/admin/login?error=not-an-editor");
  }
  return to("/admin");
}
