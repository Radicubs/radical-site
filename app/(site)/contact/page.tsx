import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { getSiteSettings } from "@/lib/cms";
import { GetInvolvedFlow } from "@/components/contact/get-involved-flow";
import "./contact.css";

export const metadata: Metadata = {
  title: "Get Involved | Radicubs",
  description: "Want to join, support, or ask something about Radicubs? Get in touch with the team."
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const flow = {
    applyUrl: settings.applyUrl,
    season: `${settings.applicationSeason}–${settings.applicationSeason + 1}`,
    email: settings.email,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY?.trim() || "0x4AAAAAAAS8m1QMSH1rRxYU"
  };

  return (
    <main className="contact-page">
      <Navbar settings={settings} />
      <section className="wrap ct-hero">
        <AnimatedSection>
          <h1>Get involved</h1>
          <p className="section-copy">Thinking about joining us? Want to sponsor a season? We'd love to hear from you. You can also email <a className="text-link" href={`mailto:${settings.email}`}>{settings.email}</a>.</p>
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
          <Suspense fallback={null}><GetInvolvedFlow {...flow} /></Suspense>
        </AnimatedSection>
      </section>
      <Footer />
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
    </main>
  );
}
