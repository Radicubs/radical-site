import { AnimatedSection } from "@/components/ui/animated-section";
import type { OutreachContent } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";
import type { PageText } from "@/lib/page-text";
import { OutreachReel } from "./outreach-reel";
import { OutreachStats } from "./outreach-stats";
import "./outreach-body.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function OutreachBody({ content, text: t }: { content: OutreachContent; text: PageText["outreach"] }) {
  const { intro, stats, programs, partners, events } = content;
  return <>
    <section className="section outreach-intro"><div className="wrap">
      <div className="outreach-intro-grid">
        <AnimatedSection>
          <p className="outreach-eyebrow">{t.whyEyebrow}</p>
          <h2>{rich(t.whyTitle)}</h2>
          <p className="outreach-lead">{t.whyCopy}</p>
        </AnimatedSection>
        <AnimatedSection delay={.08}>
          <figure className="outreach-cell outreach-intro-photo">
            {intro && <img src={intro.src} srcSet={intro.srcSet} sizes="(max-width: 760px) 100vw, 50vw" alt="Radicubs members with their robot at an outreach booth" loading="lazy" decoding="async" />}
          </figure>
        </AnimatedSection>
      </div>
      <OutreachStats stats={stats} />
    </div></section>

    <OutreachReel events={events} text={t} />

    <section className="section outreach-programs" aria-labelledby="outreach-programs-title"><div className="wrap">
      <div className="outreach-head">
        <h2 id="outreach-programs-title">{rich(t.programsTitle)}</h2>
        <p className="section-copy">{t.programsCopy}</p>
      </div>
      <ul className="outreach-program-grid">{programs.map((program, i) => <li key={program.key}>
        <AnimatedSection delay={i * .05} className="outreach-cell outreach-program">
          <span className="outreach-index">{pad(i + 1)} / {pad(programs.length)}</span>
          <h3>{program.title}</h3>
          <p>{program.copy}</p>
          <span className="outreach-where">{program.where}</span>
        </AnimatedSection>
      </li>)}</ul>
    </div></section>

    <section className="outreach-partners" aria-label="Outreach partners">
      <div className="wrap"><p className="outreach-eyebrow">{t.partnersEyebrow}</p></div>
      <div className="outreach-marquee">
        {/* Two identical runs; the strip slides by exactly one run, so the loop is seamless. */}
        {[0, 1].map((run) => <ul key={run} aria-hidden={run === 1 || undefined}>
          {partners.map((name) => <li key={name}>{name}<span aria-hidden="true">✦</span></li>)}
        </ul>)}
      </div>
    </section>
  </>;
}
