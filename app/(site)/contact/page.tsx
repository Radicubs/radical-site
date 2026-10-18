import { textMetadata } from "@/lib/seo";
import { Suspense } from "react";
import Script from "next/script";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { getPageText, getSiteSettings } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";
import { seasonLabel } from "@/lib/page-text";
import { GetInvolvedFlow } from "@/components/contact/get-involved-flow";
import "./contact.css";

export async function generateMetadata() {
  return textMetadata("/contact", (await getPageText()).contact);
}

export default async function ContactPage() {
  const [settings, { contact: t }] = await Promise.all([getSiteSettings(), getPageText()]);
  const flow = {
    applyUrl: settings.applyUrl,
    season: seasonLabel(settings.applicationSeason),
    text: t,
    email: settings.email,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY?.trim() || "0x4AAAAAAAS8m1QMSH1rRxYU"
  };

  return (
    <main className="contact-page">
      <Navbar settings={settings} />
      <section className="wrap ct-hero">
        <AnimatedSection>
          <h1>{rich(t.title)}</h1>
          <p className="section-copy">{rich(t.copy, { email: <a className="text-link" href={`mailto:${settings.email}`}>{settings.email}</a> })}</p>
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
