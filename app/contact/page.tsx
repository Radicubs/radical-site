import Script from "next/script";
import { Mail, UserPlus } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { site } from "@/data/site";

type ContactPageProps = {
  searchParams?: Promise<{ success?: string; message?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const statusMessage = params?.message;
  const succeeded = params?.success === "true";
  const contactApiUrl = process.env.CONTACT_API_URL ?? "https://contact.radicubs.com";
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY ?? "0x4AAAAAAAS8m1QMSH1rRxYU";

  return (
    <main>
      <Navbar />
      <section className="page-hero">
        <div className="wrap contact-grid">
          <AnimatedSection>
            <p className="eyebrow">Get in touch</p>
            <h1>Contact Us</h1>
            <p className="section-copy">Questions about joining, sponsorships, outreach, or the team? Send a note or reach us directly by email.</p>
            <div className="contact-list">
              <a className="contact-item" href={`mailto:${site.email}`}><Mail size={20} aria-hidden="true" />{site.email}</a>
              <a className="contact-item" href={site.applyUrl} target="_blank" rel="noreferrer"><UserPlus size={20} aria-hidden="true" />Apply for the 2026–2027 season ↗</a>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <form className="form" data-tilt-card action={contactApiUrl} method="post">
              {statusMessage && (
                <div className={`contact-status ${succeeded ? "success" : "error"}`} role="status">
                  {statusMessage}
                </div>
              )}
              <div className="form-row">
                <label>Name<input name="name" placeholder="Your name" required /></label>
                <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
              </div>
              <label style={{ marginTop: 18 }}>Message<textarea name="message" rows={8} maxLength={1500} placeholder="How can we help?" /></label>
              <div className="contact-turnstile">
                <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
              </div>
              <button className="btn btn-dark" style={{ marginTop: 20, width: "100%" }} type="submit">Send</button>
            </form>
          </AnimatedSection>
        </div>
      </section>
      <Footer />
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
    </main>
  );
}
