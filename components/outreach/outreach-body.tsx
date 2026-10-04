import { AnimatedSection } from "@/components/ui/animated-section";
import type { OutreachContent } from "@/lib/cms";
import { OutreachReel } from "./outreach-reel";
import { OutreachStats } from "./outreach-stats";
import "./outreach-body.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function OutreachBody({ content }: { content: OutreachContent }) {
  const { intro, stats, programs, partners, events } = content;
  return <>
    <section className="section outreach-intro"><div className="wrap">
      <div className="outreach-intro-grid">
        <AnimatedSection>
          <p className="outreach-eyebrow">Why we do it</p>
          <h2>Taking the robot <em>out.</em></h2>
          <p className="outreach-lead">The robot spends plenty of time outside our shop. Since 2021–22, we've taken it to libraries, festivals, camps, and classrooms around Frisco and Lewisville. We plan and run the events ourselves, and we love seeing what kids ask when they get close to a real competition robot.</p>
        </AnimatedSection>
        <AnimatedSection delay={.08}>
          <figure className="outreach-cell outreach-intro-photo">
            {intro && <img src={intro.src} srcSet={intro.srcSet} sizes="(max-width: 760px) 100vw, 50vw" alt="Radicubs members with their robot at an outreach booth" loading="lazy" decoding="async" />}
          </figure>
        </AnimatedSection>
      </div>
      <OutreachStats stats={stats} />
    </div></section>

    <OutreachReel events={events} />

    <section className="section outreach-programs" aria-labelledby="outreach-programs-title"><div className="wrap">
      <div className="outreach-head">
        <h2 id="outreach-programs-title">What we <em>run.</em></h2>
        <p className="section-copy">Here are a few ways we share robotics with our community.</p>
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
      <div className="wrap"><p className="outreach-eyebrow">With thanks to our partners</p></div>
      <div className="outreach-marquee">
        {/* Two identical runs; the strip slides by exactly one run, so the loop is seamless. */}
        {[0, 1].map((run) => <ul key={run} aria-hidden={run === 1 || undefined}>
          {partners.map((name) => <li key={name}>{name}<span aria-hidden="true">✦</span></li>)}
        </ul>)}
      </div>
    </section>
  </>;
}
