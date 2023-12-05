import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend("re_PgYGPnrn_CPxwUHP8fW4CPGZg41Txp5NV");

export const POST: APIRoute = async ({ params, request }) => {
  if (request.headers.get("Content-Type") !== "application/json") return new Response(null, { status: 400 });
  const body = await request.json();
  console.log(body);

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: "radicubs@gmail.com",
    subject: "[Contact Form] " + body.name,
    text: body.message + "\n\n---\n" + body.email
  });

  return new Response(null, { status: 200 });
};
