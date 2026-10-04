const CONTACT_API_URL = process.env.CONTACT_API_URL ?? "https://contact.radicubs.com";

/**
 * Relays the get-involved form to the contact API. The API answers every post with a
 * redirect to the live site's /contact/?success=&message=, so posting to it directly
 * leaves this site; here the redirect is read server-side and returned as JSON.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const body = new URLSearchParams();
  for (const [key, value] of form) if (typeof value === "string") body.append(key, value);

  try {
    const upstream = await fetch(CONTACT_API_URL, { method: "POST", body, redirect: "manual", cache: "no-store" });
    const location = upstream.headers.get("location");
    const result = location ? new URL(location, CONTACT_API_URL).searchParams : null;
    const success = result ? result.get("success") === "true" : upstream.ok;
    const message = result?.get("message") ?? (success ? null : `The contact service returned ${upstream.status}.`);
    return Response.json({ success, message }, { status: success ? 200 : 502 });
  } catch {
    return Response.json({ success: false, message: "We couldn't reach the contact service." }, { status: 502 });
  }
}
