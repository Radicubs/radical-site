"use client";

import { createBrowserClient } from "@supabase/ssr";
import { LogOutIcon } from "@payloadcms/ui";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { googleLoginEnabled } from "./auth-settings";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = () => createBrowserClient(url!, key!);

const errors: Record<string, string> = {
  "not-an-editor": "That Google account isn't on the editor list. Ask an admin to add your email under Settings → Editors.",
  "google-failed": "Google sign-in didn't finish. Please try again."
};

function GoogleMark() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>;
}

// Shown under the email/password form on /admin/login.
export function GoogleLogin() {
  const error = useSearchParams().get("error");
  const [busy, setBusy] = useState(false);
  if (!googleLoginEnabled || !url || !key) return null;

  async function signIn() {
    setBusy(true);
    const { error: failed } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (failed) setBusy(false);
  }

  return <div style={{ marginTop: "calc(var(--base) * 1.5)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--base)", color: "var(--theme-elevation-500)", fontSize: 13 }}>
      <span style={{ flex: 1, height: 1, background: "var(--theme-elevation-150)" }} />or<span style={{ flex: 1, height: 1, background: "var(--theme-elevation-150)" }} />
    </div>
    <button
      type="button"
      onClick={signIn}
      disabled={busy}
      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 16px", borderRadius: "var(--style-radius-s)", border: "1px solid var(--theme-elevation-250)", background: "var(--theme-elevation-0)", color: "var(--theme-text)", font: "inherit", fontWeight: 500, cursor: busy ? "wait" : "pointer" }}
    >
      <GoogleMark />{busy ? "Opening Google…" : "Sign in with Google"}
    </button>
    {error && errors[error] && <p role="alert" style={{ marginTop: "var(--base)", color: "var(--theme-error-500)" }}>{errors[error]}</p>}
  </div>;
}

// Replaces the sidebar's log-out button so signing out also ends the Google session;
// otherwise the next visit would sign the editor straight back in.
export function LogoutButton() {
  return <a
    href="/admin/logout"
    className="nav__log-out"
    aria-label="Log out"
    title="Log out"
    onClick={async (event) => {
      event.preventDefault();
      if (url && key) await supabase().auth.signOut().catch(() => {});
      window.location.href = "/admin/logout";
    }}
  >
    <LogOutIcon />
  </a>;
}
