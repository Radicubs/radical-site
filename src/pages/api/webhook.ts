import type { APIRoute } from "astro";
import { execa } from "execa";

let pending = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get("Authorization");
  if (token !== import.meta.env.STRAPI_WEBHOOK_TOKEN) return new Response(null, { status: 403 });
  if (pending) return new Response(null, { status: 200 });
  pending = true;

  setTimeout(async () => {
    pending = false;

    await execa("git", ["pull"]);
    await execa("yarn", ["install"]);
    await execa("yarn", ["build"]);

    return new Response(null, { status: 200 });
  }, 1000 * 60 * 5);
};
