import { LinkArrow } from "@/components/ui/link-arrow";
import { textMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import Link from "@/components/ui/intent-link";
import { ArrowUpRight, Bus, Megaphone, Package, Trophy, Warehouse, Wrench } from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { AnimatedSection } from "@/components/ui/animated-section";
import { getPageText, getSiteSettings, getSponsors } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";
import { plain } from "@/lib/page-text";
import { ThemedImage } from "@/components/ui/themed-image";
import { ContinueButton } from "@/components/ui/continue-button";
import { DonateLink } from "@/components/ui/donate-link";
import "./sponsors.css";

export async function generateMetadata() {
  return textMetadata("/sponsors", (await getPageText()).sponsors);
}

// One icon per support card; the titles and text come from the CMS (fund1Title, fund1Copy, …).
const fundIcons = [Trophy, Package, Wrench, Bus, Megaphone, Warehouse];

const pad = (n: number) => String(n).padStart(2, "0");

// Wide wordmarks with thin artwork read too small at the shared logo height.
const WIDE_LOGOS = /lockheed|texas instruments/i;

export default async function SponsorsPage() {
  const [sponsors, settings, { sponsors: t }] = await Promise.all([getSponsors(), getSiteSettings(), getPageText()]);
  const { corporate, individual } = sponsors;
  const team = { team: settings.teamNumber };
  const funds = fundIcons.map((icon, index) => {
    const n = index + 1 as 1 | 2 | 3 | 4 | 5 | 6;
    return { icon, title: t[`fund${n}Title`], copy: t[`fund${n}Copy`] };
  });
  // The "your logo here" tile stretches to close out the last row at each breakpoint.
  const fillStyle = { "--fill-4": 4 - (corporate.length % 4), "--fill-2": 2 - (corporate.length % 2) } as CSSProperties;

  return (
    <main className="sponsors-page">
      <Navbar settings={settings} />

      <section className="wrap sp-hero">
        <AnimatedSection className="sp-hero-copy">
          <p className="eyebrow">{plain(t.eyebrow, team)}</p>
          <h1>{rich(t.title)}</h1>
          <p className="section-copy">{t.copy}</p>
          <div className="actions">
            <ContinueButton href="/contact?topic=sponsor">{t.becomeButton}</ContinueButton>
            <DonateLink className="btn btn-light" href={settings.donateUrl} />
          </div>
        </AnimatedSection>
        <AnimatedSection className="sp-stats" delay={0.1}>
          <dl>
            <div><dt>{t.statCorporate}</dt><dd>{pad(corporate.length)}</dd></div>
            <div><dt>{t.statIndividual}</dt><dd>{pad(individual.length)}</dd></div>
            <div><dt>{t.statNonprofit}</dt><dd className="sp-stat-text">{t.statNonprofitValue}</dd></div>
          </dl>
          <p>{t.statNote}</p>
        </AnimatedSection>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">{t.corporateEyebrow}</p><h2>{rich(t.corporateTitle)}</h2></div>
            <p className="section-copy">{t.corporateCopy}</p>
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
                <span className="sp-open-copy"><strong>{t.openTitle}</strong><span>{plain(t.openLink, team)} <LinkArrow direction="right" /></span></span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="section sp-section">
        <div className="wrap">
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">{t.individualEyebrow}</p><h2>{rich(t.individualTitle)}</h2></div>
            <p className="section-copy">{t.individualCopy}</p>
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
          <AnimatedSection className="sp-head">
            <div><p className="eyebrow">{t.fundsEyebrow}</p><h2>{rich(t.fundsTitle)}</h2></div>
            <p className="section-copy">{t.fundsCopy}</p>
          </AnimatedSection>
          <div className="sp-funds">
            {funds.map(({ icon: Icon, title, copy }, index) => (
              <AnimatedSection key={index} className="sp-fund" delay={(index % 3) * 0.06}>
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
          <AnimatedSection className="sp-join">
            <div className="sp-join-intro">
              <p className="eyebrow">{t.joinEyebrow}</p>
              <h2>{rich(t.joinTitle)}</h2>
              <p className="section-copy">{rich(t.joinCopy, { email: <a className="text-link" href={`mailto:${settings.email}`}>{settings.email}</a> })}</p>
            </div>
            <div className="sp-join-options">
              <Link className="sp-option" href="/contact?topic=sponsor">
                <span className="sp-index">01</span>
                <span className="sp-option-body"><strong>{t.option1Title}</strong><span>{t.option1Copy}</span></span>
                <ArrowUpRight className="sp-option-arrow" size={22} aria-hidden="true" />
              </Link>
              <a className="sp-option" href={settings.donateUrl} target="_blank" rel="noreferrer">
                <span className="sp-index">02</span>
                <span className="sp-option-body"><strong>{t.option2Title}</strong><span>{t.option2Copy}</span></span>
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
