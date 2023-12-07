import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_TOKEN);

const rl = new Map<string, number>();

const redirect = (success: boolean, message: string) =>
  new Response(null, {
    status: 303,
    headers: {
      Location: `/contact?success=${success}&message=${message}`
    }
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (rl.has(clientAddress)) return redirect(false, "You have already sent a message. Please try again later.");
  rl.set(clientAddress, Date.now());
  setTimeout(() => rl.delete(clientAddress), 1000 * 60);
  const body = await request.formData();

  const name = body.get("name");
  const email = body.get("email");
  const message = body.get("message");

  if (!name || typeof name !== "string" || name.length > 100) return redirect(false, "Invalid name.");
  if (!email || typeof email !== "string" || !email.includes("@")) return redirect(false, "Invalid email.");
  if (!message || typeof message !== "string" || message.length > 1500) return redirect(false, "Invalid message.");

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: "radicubs@gmail.com",
    subject: "[Contact Form] " + name,
    text: message + "\n\n---\n" + email
  });

  return redirect(true, "Message sent!");
};
