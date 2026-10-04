import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/ui/intent-link";
import { ArrowUpRight, Bus, Megaphone, Package, Trophy, Warehouse, Wrench } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getSiteSettings, getSponsors } from "@/lib/cms";
import { ThemedImage } from "@/components/ui/themed-image";
import { ContinueButton } from "@/components/ui/continue-button";
import { DonateLink } from "@/components/ui/donate-link";
import "./sponsors.css";

export const metadata: Metadata = {
  title: "Sponsors | Radicubs",
  description: "Meet the companies, foundations, and families who help Radicubs build and compete."
};

const funds = [
  { icon: Trophy, title: "Competition fees", copy: "Entry fees for the FIRST Robotics Competition events we attend each season." },
  { icon: Package, title: "Materials & parts", copy: "Aluminum, motors, electronics, and the spares a robot goes through." },
  { icon: Wrench, title: "Tools", copy: "The equipment we use to build parts and check that they work." },
  { icon: Bus, title: "Travel", copy: "Getting the team and the robot to events away from home." },
  { icon: Megaphone, title: "Outreach", copy: "Robot demos, workshops and camps for kids around Frisco." },
  { icon: Warehouse, title: "Workspace", copy: "A place where we can design, build, test, and start over when we need to." }
];

const pad = (n: number) => String(n).padStart(2, "0");

// Wide wordmarks with thin artwork read too small at the shared logo height.
const WIDE_LOGOS = /lockheed|texas instruments/i;

export default async function SponsorsPage() {
  const [sponsors, settings] = await Promise.all([getSponsors(), getSiteSettings()]);
  const { corporate, individual } = sponsors;
  // The "your logo here" tile stretches to close out the last row at each breakpoint.
  const fillStyle = { "--fill-4": 4 - (corporate.length % 4), "--fill-2": 2 - (corporate.length % 2) } as CSSProperties;

  return (
    <main className="sponsors-page">
      <Navbar settings={settings} />

      <section className="wrap sp-hero">
        <AnimatedSection className="sp-hero-copy">
          <p className="eyebrow">FRC Team {settings.teamNumber}</p>
          <h1>Our sponsors</h1>
          <p className="section-copy">
            We run this team ourselves, but we don&apos;t do it alone. The companies, foundations, and families here help pay for the robot, our tools, and the trips that get us to competition.
          </p>
          <div className="actions">
            <ContinueButton href="/contact?topic=sponsor">Become a sponsor</ContinueButton>
            <DonateLink className="btn btn-light" href={settings.donateUrl} />
          </div>
        </AnimatedSection>
        <AnimatedSection className="sp-stats" delay={0.1}>
          <dl>
            <div><dt>Corporate partners</dt><dd>{pad(corporate.length)}</dd></div>
            <div><dt>Individual sponsors</dt><dd>{pad(individual.length)}</dd></div>
            <div><dt>Nonprofit status</dt><dd className="sp-stat-text">501(c)(3)</dd></div>
          </dl>
          <p>Donations are tax-deductible.</p>
        </AnimatedSection>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">Partners</p><h2>Corporate sponsors</h2></div>
            <p className="section-copy">These organizations help us turn ideas into a working robot.</p>
          </AnimatedSection>
          <ul className="sp-logo-grid">
            {corporate.map((sponsor, index) => (
              <li key={sponsor.name}>
                <AnimatedSection delay={(index % 4) * 0.05}>
                  <a className="sp-logo-tile" href={sponsor.href} target="_blank" rel="noreferrer">
                    <span className={WIDE_LOGOS.test(sponsor.name) ? "sp-logo sp-logo--wide" : "sp-logo"}>
                      <ThemedImage src={sponsor.pageLogo ?? sponsor.logo} lightSrc={sponsor.lightLogo} alt={`${sponsor.name} logo`} loading="lazy" decoding="async" />
                    </span>
                    <span className="sp-logo-meta">
                      <span>{sponsor.name}</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </a>
                </AnimatedSection>
              </li>
            ))}
            <li className="sp-logo-open" style={fillStyle}>
              <Link className="sp-logo-tile sp-logo-tile--open" href="/contact?topic=sponsor">
                <span className="sp-open-copy"><strong>Your logo here</strong><span>Partner with Team {settings.teamNumber} →</span></span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">Impact</p><h2>What your support builds</h2></div>
            <p className="section-copy">Your support goes straight into the work we do all season.</p>
          </AnimatedSection>
          <div className="sp-funds">
            {funds.map(({ icon: Icon, title, copy }, index) => (
              <AnimatedSection key={title} className="sp-fund" delay={(index % 3) * 0.06}>
                <div className="sp-fund-top"><span className="sp-index">{pad(index + 1)}</span><Icon size={20} strokeWidth={1.75} aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">Community</p><h2>Individual sponsors</h2></div>
            <p className="section-copy">To the families and friends who have pitched in: thank you.</p>
          </AnimatedSection>
          <AnimatedSection>
            <ol className="sp-names">
              {individual.map((name, index) => (
                <li key={name}><span className="sp-index">{pad(index + 1)}</span>{name}</li>
              ))}
            </ol>
          </AnimatedSection>
        </div>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-join">
            <div className="sp-join-intro">
              <p className="eyebrow">Get involved</p>
              <h2>Join our sponsors</h2>
              <p className="section-copy">Want to talk through a sponsorship? Email us at <a className="text-link" href={`mailto:${settings.email}`}>{settings.email}</a>.</p>
            </div>
            <div className="sp-join-options">
              <Link className="sp-option" href="/contact?topic=sponsor">
                <span className="sp-index">01</span>
                <span className="sp-option-body"><strong>Become a sponsor</strong><span>Companies, families, and individuals are all welcome. We'll recognize your support here.</span></span>
                <ArrowUpRight className="sp-option-arrow" size={22} aria-hidden="true" />
              </Link>
              <a className="sp-option" href={settings.donateUrl} target="_blank" rel="noreferrer">
                <span className="sp-index">02</span>
                <span className="sp-option-body"><strong>Make a donation</strong><span>Give directly to the team. Tax-deductible.</span></span>
                <ArrowUpRight className="sp-option-arrow" size={22} aria-hidden="true" />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
